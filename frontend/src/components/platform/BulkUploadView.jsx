import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  ShieldCheck, 
  Play, 
  Check, 
  ArrowRight,
  RefreshCw, 
  FileText, 
  FileCheck, 
  Zap, 
  Clock,
  Eye,
  X,
  User,
  Radio,
  MapPin,
  Calendar,
  Building2,
  ExternalLink,
  MessageSquare,
  AlertTriangle,
  SendHorizontal,
  Download,
  AlertOctagon,
  XCircle,
  FileX,
  Trash2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import FullAnalysisModal from './FullAnalysisModal';
import * as XLSX from 'xlsx';
import { api } from '../../services/api';
import { 
  clearAllSafetyData, 
  ingestBatchReports, 
  syncBackendReportsToStore,
  getTodayDateString, 
  getStoreState, 
  subscribeSafetyStore, 
  evaluateSIFPrecursor,
  extractUnitKey
} from '../../services/safetyStore';

// 5 CORE SAFETY FIELDS (Reference ID is automatically generated upon ingestion matching Analyze workflow)
const REQUIRED_FIELDS = [
  'Date',
  'Site',
  'Report Type',
  'Description',
  'Hazard'
];

// Helper to map and normalize any row to the standard schema with auto-generated Reference ID
const mapRowToSchema = (rawRow, idx, startingNum = 1, todayStr) => {
  const keys = Object.keys(rawRow || {});
  const getRawVal = (...aliases) => {
    for (const alias of aliases) {
      const match = keys.find(k => k.trim().toLowerCase() === alias.toLowerCase());
      if (match && rawRow[match] !== undefined && rawRow[match] !== null && rawRow[match] !== '') {
        return rawRow[match];
      }
    }
    return '';
  };
  const getVal = (...aliases) => {
    const v = getRawVal(...aliases);
    return v !== undefined && v !== null ? String(v).trim() : '';
  };

  const today = todayStr || getTodayDateString();
  const existingRef = getVal('Reference', 'reference', 'ref', 'report_id', 'id', 'Report Reference', 'report_reference');
  // Auto-generate reference matching the exact Analyze workflow format (REP-ID001-XXXX)
  const ref = existingRef || `REP-ID001-${String(startingNum + idx).padStart(4, '0')}`;
  
  let dateRaw = getRawVal('Date', 'date', 'report_date', 'Report Date');
  let dateVal = today;

  if (dateRaw instanceof Date && !isNaN(dateRaw.getTime())) {
    dateVal = dateRaw.toISOString().split('T')[0];
  } else if (typeof dateRaw === 'number' || (!isNaN(Number(dateRaw)) && /^\d+(\.\d+)?$/.test(String(dateRaw).trim()))) {
    const serial = Number(dateRaw);
    if (serial > 20000 && serial < 90000) {
      const d = new Date(Math.round((serial - 25569) * 86400 * 1000));
      dateVal = !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : today;
    } else {
      dateVal = today;
    }
  } else if (typeof dateRaw === 'string' && dateRaw.trim()) {
    const s = dateRaw.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      dateVal = s;
    } else {
      const parsed = new Date(s);
      dateVal = !isNaN(parsed.getTime()) ? parsed.toISOString().split('T')[0] : today;
    }
  }

  const siteVal = getVal('Site', 'site', 'location', 'Location', 'Unit', 'unit', 'Facility', 'facility') || `Unit ${(idx % 4) + 1}`;
  const typeVal = getVal('Report Type', 'report_type', 'ReportType', 'Type', 'type', 'Classification') || 'Near Miss';
  const rawDesc = getVal('Description', 'description', 'desc', 'Observation', 'observation', 'statement', 'Incident Description') || '';
  const descVal = rawDesc.trim(); // Preserve full description without arbitrary slicing
  const hazardVal = getVal('Hazard', 'hazard', 'Identified Hazard', 'Risk', 'risk', 'Hazard Category') || 'Operational Safety Finding';

  return {
    Reference: ref,
    Date: String(dateVal).trim(),
    Site: siteVal,
    'Report Type': typeVal,
    Description: descVal,
    Hazard: hazardVal
  };
};

export default function BulkUploadView({ onNavigate }) {
  const { user } = useAuth();
  const isAdmin = Boolean(
    user?.is_admin || 
    user?.role === 'ADMINISTRATOR' || 
    user?.role_name === 'Administrator' || 
    (user?.email && user.email.toLowerCase().includes('admin'))
  );

  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [validationSuccess, setValidationSuccess] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [batchResults, setBatchResults] = useState([]);
  const [batchStats, setBatchStats] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const fileInputRef = useRef(null);

  // Initialize batch results from store state
  useEffect(() => {
    const storeState = getStoreState();
    if (storeState.isWiped) {
      setBatchResults([]);
    } else if (storeState.reports && storeState.reports.length > 0) {
      setBatchResults(storeState.reports.map((r, i) => ({
        id: r.id || Date.now() + i,
        ref: r.report_reference || `REP-ID001-${String(i + 1).padStart(4, '0')}`,
        date: r.report_date || getTodayDateString(),
        submittedAt: `${r.report_date || getTodayDateString()} (Active)`,
        submittedBy: 'Bulk Ingestion System',
        submitterRole: 'Safety Auditor (Automated)',
        submissionChannel: '5-Field Bulk CSV Ingestion',
        submissionMode: 'Direct Field Sync',
        site: r.location || 'Unit 1',
        type: r.report_type || 'Near Miss',
        desc: r.description,
        statement: r.description,
        immediateAction: r.recommended_action || 'Barrier audit and physical isolation enforced.',
        isSIF: r.sif_precursor_assessment === 'YES',
        hazard: r.identified_hazard || 'Operational Safety Finding',
        energySource: r.energy_source || 'Mechanical / Operational Vector',
        barrierStatus: r.barrier_status || 'CRITICAL BARRIER FAILED',
        severityPotential: r.sif_precursor_assessment === 'YES' ? 'FATALITY / PERMANENT DISABILITY POTENTIAL (95%)' : 'Minor Observation'
      })));
    } else {
      setBatchResults([]);
    }

    const unsub = subscribeSafetyStore((newState) => {
      if (newState.isWiped) {
        setBatchResults([]);
      } else if (newState.reports && newState.reports.length > 0) {
        setBatchResults(newState.reports.map((r, i) => ({
          id: r.id || Date.now() + i,
          ref: r.report_reference || `REP-ID001-${String(i + 1).padStart(4, '0')}`,
          date: r.report_date || getTodayDateString(),
          submittedAt: `${r.report_date || getTodayDateString()} (Active)`,
          submittedBy: 'Bulk Ingestion System',
          submitterRole: 'Safety Auditor (Automated)',
          submissionChannel: '5-Field Bulk CSV Ingestion',
          submissionMode: 'Direct Field Sync',
          site: r.location || 'Unit 1',
          type: r.report_type || 'Near Miss',
          desc: r.description,
          statement: r.description,
          immediateAction: r.recommended_action || 'Barrier audit and physical isolation enforced.',
          isSIF: r.sif_precursor_assessment === 'YES',
          hazard: r.identified_hazard || 'Operational Safety Finding',
          energySource: r.energy_source || 'Mechanical / Operational Vector',
          barrierStatus: r.barrier_status || 'CRITICAL BARRIER FAILED',
          severityPotential: r.sif_precursor_assessment === 'YES' ? 'FATALITY / PERMANENT DISABILITY POTENTIAL (95%)' : 'Minor Observation'
        })));
      }
    });

    return unsub;
  }, []);

  const showToast = (type, text) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // 1-Click CLEAR ALL STATIC DATA (Start Fresh Today) - Administrator Only
  const handleClearAllData = async () => {
    if (!isAdmin) {
      showToast('error', 'Action Restricted: Only Administrators can reset or wipe static organization data.');
      return;
    }
    try {
      await clearAllSafetyData();
      setSelectedFile(null);
      setParsedRows([]);
      setValidationError(null);
      setValidationSuccess(null);
      setUploadComplete(false);
      setProgress(0);
      setBatchResults([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      showToast('success', 'All historical static data erased! System is clean and ready to ingest and analyze starting from today.');
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to clear data.');
    }
  };

  // Download official 5-field blank CSV template
  const downloadStandardTemplate = () => {
    const csvContent = "Date,Site,Report Type,Description,Hazard\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `safety_register_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('info', 'Standard 5-field CSV template downloaded.');
  };

  // Helper CSV parser handling commas within quotes

  const validateAndSetFile = (file) => {
    if (!file) return;

    setUploadComplete(false);
    setProgress(0);
    setValidationError(null);
    setValidationSuccess(null);

    const today = getTodayDateString();
    const fileName = file.name.toLowerCase();

    const processRawRows = (rawRows, detectedHeaders) => {
      if (!rawRows || rawRows.length === 0) {
        setValidationError({
          type: 'EMPTY_ROWS',
          title: 'UPLOAD REJECTED: NO DATA ROWS FOUND',
          message: 'The file contains header columns but no data rows. Please ensure rows with safety observations are present.',
          count: detectedHeaders.length,
          headers: detectedHeaders
        });
        setSelectedFile(file);
        setParsedRows([]);
        return;
      }

      // Map rows to schema preserving full description
      const normalizedRows = rawRows.map((r, idx) => mapRowToSchema(r, idx, 1, today));

      // Validate against backend schema constraints
      const violations = [];
      normalizedRows.forEach((r, idx) => {
        const rowNum = idx + 1;
        const desc = (r.Description || '').trim();
        const loc = (r.Site || '').trim();

        if (!desc || desc.length < 5) {
          violations.push(`Row ${rowNum}: Description has ${desc.length} chars (minimum 5 required).`);
        } else if (desc.length > 100) {
          violations.push(`Row ${rowNum}: Description has ${desc.length} chars (maximum 100 allowed).`);
        }

        if (!loc || loc.length < 2) {
          violations.push(`Row ${rowNum}: Site / Location is too short (minimum 2 characters required).`);
        }
      });

      if (violations.length > 0) {
        const previewViolations = violations.slice(0, 4).join(' ');
        const extra = violations.length > 4 ? ` (+${violations.length - 4} more)` : '';
        setValidationError({
          type: 'SCHEMA_VIOLATION',
          title: 'SCHEMA VALIDATION FAILED: CONSTRAINTS VIOLATED',
          message: `${violations.length} record(s) violate backend schema requirements: ${previewViolations}${extra}. Please ensure descriptions are 5–100 characters and location is at least 2 characters.`,
          count: detectedHeaders.length,
          headers: detectedHeaders
        });
        setSelectedFile(file);
        setParsedRows(normalizedRows);
        return;
      }

      // Check for intra-file duplicate rows (matching Date, Location, Report Type, Description)
      const seenFileKeys = new Set();
      let intraFileDups = 0;
      normalizedRows.forEach((r) => {
        let cleanType = (r['Report Type'] || '').toUpperCase().replace(/[\s-]/g, '_');
        const key = `${r.Date}|${(r.Site || '').trim().toLowerCase()}|${cleanType}|${(r.Description || '').trim().toLowerCase()}`;
        if (seenFileKeys.has(key)) {
          intraFileDups++;
        } else {
          seenFileKeys.add(key);
        }
      });

      setParsedRows(normalizedRows);
      setValidationSuccess({
        title: `SCHEMA VALIDATED: ${normalizedRows.length} RECORDS READY FOR INGESTION`,
        message: intraFileDups > 0
          ? `File verified: ${normalizedRows.length} observation row(s) processed (${intraFileDups} duplicate row(s) within this file will be skipped automatically). Ready for backend AI ingestion.`
          : `File verified: ${normalizedRows.length} observation row(s) successfully processed with 5 core safety fields. Sequential Reference IDs (REP-ID001-XXXX) assigned. Ready for backend AI ingestion.`,
        count: detectedHeaders.length,
        headers: detectedHeaders
      });
      setSelectedFile(file);
    };

    try {
      if (fileName.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const text = e.target?.result || '';
            const parsed = JSON.parse(text);
            const rawRows = Array.isArray(parsed) ? parsed : [parsed];
            const sample = rawRows[0] || {};
            const detectedHeaders = Object.keys(sample);
            processRawRows(rawRows, detectedHeaders);
          } catch (err) {
            setValidationError({
              type: 'PARSE_ERROR',
              title: 'JSON PARSING ERROR',
              message: 'Unable to parse JSON file. Please ensure a valid JSON array of safety observation objects.',
              count: 0,
              headers: []
            });
            setSelectedFile(null);
            setParsedRows([]);
          }
        };
        reader.readAsText(file);
      } else {
        // Use SheetJS (XLSX) to parse actual XLSX, XLS, CSV, TXT content
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result);
            const workbook = XLSX.read(data, { type: 'array', cellDates: true });
            if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
              throw new Error('Workbook contains no sheets.');
            }
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const rawRows = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
            const sample = rawRows[0] || {};
            const detectedHeaders = Object.keys(sample);
            processRawRows(rawRows, detectedHeaders);
          } catch (err) {
            console.error('File parsing error:', err);
            setValidationError({
              type: 'PARSE_ERROR',
              title: 'FILE PARSING ERROR',
              message: `Unable to parse ${file.name}. Please ensure standard CSV, Excel (.xlsx/.xls), or tabular format with core safety fields.`,
              count: 0,
              headers: []
            });
            setSelectedFile(null);
            setParsedRows([]);
          }
        };
        reader.readAsArrayBuffer(file);
      }
    } catch (err) {
      setValidationError({
        type: 'READ_ERROR',
        title: 'FILE READ ERROR',
        message: err.message || 'Unable to read the selected file.',
        count: 0,
        headers: []
      });
      setSelectedFile(null);
      setParsedRows([]);
    }
  };

  const handleExecuteUpload = async () => {
    if (!selectedFile || validationError || !parsedRows || parsedRows.length === 0) return;

    setIsProcessing(true);
    setProgress(15);
    setUploadComplete(false);

    try {
      const today = getTodayDateString();
      const payload = parsedRows.map((r, idx) => {
        let cleanType = (r['Report Type'] || r.report_type || 'NEAR_MISS').toUpperCase().replace(/[\s-]/g, '_');
        if (!['UNSAFE_ACT', 'UNSAFE_CONDITION', 'NEAR_MISS'].includes(cleanType)) {
          if (cleanType.includes('ACT')) cleanType = 'UNSAFE_ACT';
          else if (cleanType.includes('COND')) cleanType = 'UNSAFE_CONDITION';
          else if (cleanType.includes('NEAR') || cleanType.includes('MISS')) cleanType = 'NEAR_MISS';
          else cleanType = 'UNSAFE_CONDITION';
        }

        return {
          report_type: cleanType,
          description: (r.Description || r.description || '').trim(),
          location: (r.Site || r.location || `Unit ${(idx % 4) + 1}`).trim(),
          report_date: r.Date || r.report_date || today,
          additional_context: `Hazard: ${r.Hazard || r.hazard || 'Operational Safety Observation'} | Uploaded Bulk Register`
        };
      });

      setProgress(40);

      // Real asynchronous API call to POST /api/reports/batch
      const result = await api.batchUploadReports(payload);

      setProgress(85);

      if (!result || !result.reports || result.reports.length === 0) {
        throw new Error(result?.message || 'No records were ingested by the backend server.');
      }

      // Synchronize to store with real backend-generated references and database IDs
      syncBackendReportsToStore(result.reports, parsedRows, false);

      // Populate UI batch telemetry with actual persisted reports from backend
      const displayedItems = result.reports.map((r, idx) => {
        const matchingParsed = parsedRows[idx] || {};
        const isSIF = r.sif_precursor_assessment === 'YES';
        return {
          id: r.id,
          ref: r.report_reference,
          date: r.report_date,
          submittedAt: `${r.report_date} (Ingested)`,
          submittedBy: 'Bulk Ingestion System',
          submitterRole: 'Safety Auditor (Automated)',
          submissionChannel: selectedFile?.name || 'Bulk Register Ingestion',
          submissionMode: 'Direct Field Sync',
          site: r.location,
          type: r.report_type,
          desc: r.description,
          statement: r.description,
          immediateAction: isSIF ? 'Immediate physical barrier enforcement and audit.' : 'Routine housekeeping and shift review.',
          isSIF: isSIF,
          hazard: r.identified_hazard || matchingParsed.Hazard || 'Operational Safety Observation',
          energySource: isSIF ? 'High Energy Vector' : 'Low Mechanical Kinetic',
          barrierStatus: isSIF ? 'CRITICAL BARRIER FAILED' : 'BARRIER ADEQUATE',
          severityPotential: isSIF ? 'FATALITY / PERMANENT DISABILITY POTENTIAL (95%)' : 'Minor Observation'
        };
      });

      const newCount = result.new_count !== undefined ? result.new_count : result.ingested_count;
      const dupCount = result.duplicate_count || 0;
      setBatchStats({ newCount, dupCount });

      setBatchResults(displayedItems);
      setProgress(100);
      setIsProcessing(false);
      setUploadComplete(true);

      if (newCount > 0 && dupCount > 0) {
        showToast('success', `Batch complete: ${newCount} new report(s) saved, ${dupCount} duplicate(s) identified and skipped.`);
      } else if (newCount === 0 && dupCount > 0) {
        showToast('info', `All ${dupCount} report(s) were already persisted in the database. No duplicate records created.`);
      } else {
        showToast('success', `Batch ingestion successful! All ${newCount} reports verified and saved to database.`);
      }

    } catch (err) {
      console.error('Batch upload error:', err);
      setIsProcessing(false);
      setProgress(0);
      setUploadComplete(false);
      const errMsg = err.message || 'Bulk upload failed. Please verify server connection.';
      setValidationError({
        type: 'API_ERROR',
        title: 'BATCH INGESTION FAILED',
        message: errMsg,
        count: parsedRows.length,
        headers: []
      });
      showToast('error', errMsg);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto text-slate-800 animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 border text-xs font-bold animate-in slide-in-from-bottom-5 duration-300 max-w-md ${
          toastMessage.type === 'success' ? 'bg-emerald-950 text-emerald-200 border-emerald-700' :
          toastMessage.type === 'error' ? 'bg-rose-950 text-rose-200 border-rose-700' :
          'bg-slate-900 text-white border-slate-700'
        }`}>
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> :
           toastMessage.type === 'error' ? <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" /> :
           <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />}
          <div className="flex-1 leading-snug">{toastMessage.text}</div>
          <button onClick={() => setToastMessage(null)} className="p-1 hover:bg-white/10 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header with Clear Data & Quick Ingest Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#EAE6E1]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#FFF1EE] border border-[#FFE0D6] flex items-center justify-center text-[#FF5A36] shadow-xs">
              <UploadCloud className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 tracking-tight">
              Bulk Safety Ingestion Portal
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 ml-12">
            Batch ingest incident registers, observation spreadsheets, and contractor safety logs for autonomous SIF classification
          </p>
        </div>
      </div>

      {/* Field Schema & Governance Banner */}
      <div className="rounded-2xl bg-[#FFF8F5] border-2 border-orange-200 p-5 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF5A36] flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 font-heading flex flex-wrap items-center gap-2">
                <span>ENTERPRISE INGESTION: 5 CORE FIELDS</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono font-bold">
                  AUTO-GENERATED REFERENCE ID
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-mono font-bold">
                  MULTIPLE ENTRIES PER UNIT ALLOWED
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-orange-100 text-[#FF5A36] border border-orange-300 font-mono font-bold">
                  AI SIF CLASSIFICATION ON INGESTION
                </span>
              </h3>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                The ingestion portal accepts safety registers with <strong>5 core fields</strong> (Date, Site, Report Type, Description, Hazard). Reference IDs (e.g. <code>REP-ID001-0001</code>) are automatically generated upon ingestion, matching the AI Analyze workflow.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={downloadStandardTemplate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-orange-300 hover:border-orange-500 text-xs font-mono font-black text-[#FF5A36] shadow-xs cursor-pointer hover:bg-orange-50/50 transition-all shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Download 5-Field Template (.csv)</span>
          </button>
        </div>

        {/* The 5 Required Field Badges + Auto-Generated ID Indicator */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-orange-200/70">
          <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">Required Columns:</span>
          {REQUIRED_FIELDS.map((fieldName, i) => (
            <span 
              key={i} 
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-black bg-white border border-orange-300 text-slate-800 shadow-2xs"
            >
              <span className="w-4 h-4 rounded-full bg-[#FF5A36] text-white text-[10px] flex items-center justify-center font-bold">{i + 1}</span>
              <span>{fieldName}{fieldName === 'Description' ? ' (Max 100 Chars)' : ''}</span>
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-50 border border-emerald-300 text-emerald-800 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Reference ID: Auto-Generated (REP-ID001-XXXX)</span>
          </span>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="rounded-2xl bg-white border border-[#EAE6E1] p-6 lg:p-8 space-y-6 shadow-sm">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              validateAndSetFile(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 lg:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
            dragActive 
              ? 'border-[#FF5A36] bg-[#FFF8F5]' 
              : validationError
              ? 'border-rose-300 bg-rose-50/40 hover:bg-rose-50/70'
              : validationSuccess
              ? 'border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50/70'
              : 'border-[#EAE6E1] hover:border-[#FF5A36] bg-[#FAF8F5]'
          }`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                validateAndSetFile(e.target.files[0]);
              }
            }}
            accept=".csv,.xlsx,.xls,.json,.txt" 
            className="hidden" 
          />

          <div className={`p-4 rounded-2xl ${
            validationError 
              ? 'bg-rose-100 text-rose-600' 
              : validationSuccess 
              ? 'bg-emerald-100 text-emerald-600' 
              : 'bg-orange-50 text-[#FF5A36]'
          }`}>
            {validationError ? (
              <FileX className="w-7 h-7" />
            ) : validationSuccess ? (
              <FileCheck className="w-7 h-7" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>

          <div>
            <p className="text-sm sm:text-base font-bold text-slate-800 font-heading">
              {selectedFile ? selectedFile.name : 'Drop Safety Register or Click to Browse'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Accepts .csv, .xlsx, or .json with <strong className="text-slate-700">5 core safety fields</strong> (Date, Site, Report Type, Description, Hazard). Reference IDs are <strong className="text-emerald-700">automatically generated</strong>.
            </p>
          </div>

          {selectedFile && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#EAE6E1] text-[11px] font-mono text-slate-600">
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#FF5A36]" />
              <span>{(selectedFile.size / 1024).toFixed(1)} KB</span>
              <span>•</span>
              <span className="text-emerald-700 font-bold">Selected</span>
            </div>
          )}
        </div>

        {/* Validation Failure Card */}
        {validationError && (
          <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-900 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-rose-700">
                <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{validationError.title}</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-200 text-rose-900">
                {`Detected: ${validationError.count || 0}`}
              </span>
            </div>
            <p className="text-xs font-medium text-rose-800 leading-relaxed">
              {validationError.message}
            </p>
            {validationError.headers && validationError.headers.length > 0 && (
              <div className="pt-2 border-t border-rose-200 flex flex-wrap gap-1 text-[10.5px]">
                <span className="font-bold text-rose-900 mr-1">Found columns:</span>
                {validationError.headers.map((h, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-white border border-rose-200 font-mono text-rose-700">
                    {h}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Validation Success Card */}
        {validationSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{validationSuccess.title}</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-200 text-emerald-900">
                {parsedRows.length > 0 ? `${parsedRows.length} Records Verified` : 'Schema Verified'}
              </span>
            </div>
            <p className="text-xs font-medium text-emerald-800 leading-relaxed">
              {validationSuccess.message}
            </p>
          </div>
        )}

        {/* Ingest Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs text-slate-500">
            {selectedFile && !validationError ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Ready to ingest {parsedRows.length > 0 ? `${parsedRows.length} records` : ''} starting today ({getTodayDateString()})
              </span>
            ) : (
              <span>Select or drop a safety register file to proceed</span>
            )}
          </div>

          <button
            type="button"
            disabled={!selectedFile || Boolean(validationError) || isProcessing}
            onClick={handleExecuteUpload}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all ${
              !selectedFile || validationError || isProcessing
                ? 'bg-stone-200 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#FF6B4A] to-[#FF5A36] hover:from-[#ff5934] hover:to-[#e64a27] text-white cursor-pointer shadow-orange-500/20 active:scale-95'
            }`}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Ingesting & Analyzing Reports...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Execute AI Vector Extraction & Ingestion</span>
              </>
            )}
          </button>
        </div>

        {/* Progress State */}
        {isProcessing && (
          <div className="space-y-2 p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6E1]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-700 font-semibold flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-[#FF5A36] animate-spin" />
                Neural Energy Vector Extraction in Progress...
              </span>
              <span className="font-mono font-bold text-[#FF5A36]">{progress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#EAE6E1] overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#FF5A36] to-[#FFA133] transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Success State */}
        {uploadComplete && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center gap-2.5 text-emerald-700 font-bold">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <span>
                Batch Ingestion Completed: {batchStats 
                  ? `${batchStats.newCount} New Report(s) Saved${batchStats.dupCount > 0 ? `, ${batchStats.dupCount} Duplicate(s) Skipped` : ''}` 
                  : `${batchResults.length} Safety Records Analyzed Starting Today`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('/sif-precursors')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 cursor-pointer shadow-xs transition-colors"
              >
                Inspect SIF Precursors →
              </button>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('/reports')}
                className="px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 font-bold hover:bg-emerald-100 cursor-pointer shadow-xs transition-colors"
              >
                All Reports →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Batch Processing Output Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-1">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-heading">Ingested Batch Telemetry</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified submission records analyzed starting from today ({getTodayDateString()})
            </p>
          </div>
          <span className="text-xs font-mono text-[#FF5A36] font-bold bg-[#FFF1EE] px-2.5 py-1 rounded-full border border-[#FFE0D6]">
            {batchResults.length} Verified Records
          </span>
        </div>

        {batchResults.length === 0 ? (
          <div className="p-10 rounded-2xl bg-white border-2 border-dashed border-stone-200 text-center space-y-3 text-slate-500">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <p className="font-bold text-slate-800 text-sm">No Batch Records Ingested In Active Session</p>
            <p className="text-xs max-w-md mx-auto text-slate-400">
              Upload your organization's 5-field safety register (CSV, Excel) above to ingest and classify operational records.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {batchResults.map((item) => (
              <div 
                key={item.id}
                className="rounded-2xl bg-white border border-[#EAE6E1] hover:border-orange-300 p-6 shadow-sm space-y-4 transition-all duration-300 text-slate-800"
              >
                {/* Header: Ref, Site, Date, Badges */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-lg">
                      {item.ref}
                    </span>
                    <span className="text-xs font-bold text-slate-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-amber-600" />
                      {item.site}
                    </span>
                    <span className="text-xs font-medium text-slate-500 bg-stone-50 border border-stone-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {item.date}
                    </span>
                    {item.isSIF ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                        SIF Precursor Identified
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Routine Safety Observation
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">{item.submittedAt}</span>
                </div>

                {/* Headline & Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    {item.hazard || item.desc}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSelectedRecord(item)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF6B4A] to-[#FF5A36] hover:from-[#ff5934] hover:to-[#e64a27] text-white font-bold text-xs shadow-md shadow-orange-500/20 shrink-0 cursor-pointer flex items-center gap-1.5 transition-all self-start sm:self-auto"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.statement || item.desc}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* VIEW DETAILS MODAL: FullAnalysisModal */}
      {selectedRecord && (
        <FullAnalysisModal
          report={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}

    </div>
  );
}
