import React, { useState, useEffect } from 'react';
import { 
  Inbox, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  X, 
  ChevronRight, 
  Clock, 
  User, 
  MapPin, 
  Layers, 
  CheckSquare, 
  Square, 
  Eye, 
  MessageSquare, 
  Send, 
  FileSpreadsheet, 
  RefreshCw,
  AlertOctagon,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';
import { IOGP_LIFE_SAVING_RULES } from '../../data/platformData';

export default function ReportsTriageView({ onSelectReport, externalFilter, initialReportId }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, UNSAFE_ACT, UNSAFE_CONDITION, NEAR_MISS, INCIDENT
  const [filterSif, setFilterSif] = useState(externalFilter?.sif || 'ALL'); // ALL, SIF_YES, SIF_NO
  const [filterLsr, setFilterLsr] = useState(externalFilter?.lsr || 'ALL'); // ALL, or LSR code/name
  const [filterSite, setFilterSite] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, NEW, REVIEWED, ESCALATED

  // Selection & Bulk Actions
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkActionSuccess, setBulkActionSuccess] = useState('');

  // Drawer Detail
  const [activeDrawerReport, setActiveDrawerReport] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // HSE Reviewer Controls in Drawer
  const [reviewerClassification, setReviewerClassification] = useState('SIF_POTENTIAL');
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [isEscalated, setIsEscalated] = useState(false);
  const [isFalsePositive, setIsFalsePositive] = useState(false);
  const [auditLog, setAuditLog] = useState([
    {
      timestamp: '2026-09-06 08:30:15',
      user: 'AI/NLP Engine v2.4',
      action: 'Automated Ingestion & SIF-Precursor Assessment (94.2% confidence)'
    },
    {
      timestamp: '2026-09-06 08:35:00',
      user: 'HSSE Gatekeeper Rule',
      action: 'Tagged to IOGP LSR-04 (Safe Mechanical Lifting)'
    }
  ]);
  const [auditSavedMessage, setAuditSavedMessage] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    if (initialReportId) {
      handleOpenDrawer(initialReportId);
    }
  }, [initialReportId]);

  const loadReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getReports();
      setReports(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load safety reports');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDrawer = async (reportId) => {
    setDrawerLoading(true);
    try {
      const rep = await api.getReportById(reportId);
      setActiveDrawerReport(rep);
      setReviewerClassification(rep?.sif_precursor_assessment === 'YES' ? 'SIF_POTENTIAL' : 'NON_SIF');
      setReviewerNotes('');
      setIsEscalated(false);
      setIsFalsePositive(false);
      setAuditSavedMessage('');
    } catch (err) {
      console.error(err);
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleCloseDrawer = () => {
    setActiveDrawerReport(null);
  };

  // Map reports with synthetic enrichment for full mock demo consistency
  const enrichedReports = reports.map((r, idx) => {
    const isSIF = r.sif_precursor_assessment === 'YES';
    const lsrAssignment = IOGP_LIFE_SAVING_RULES[idx % IOGP_LIFE_SAVING_RULES.length];
    const status = idx === 0 ? 'NEW' : idx % 3 === 0 ? 'REVIEWED' : idx % 5 === 0 ? 'ESCALATED' : 'NEW';
    const reporter = idx % 2 === 0 ? 'Mechanical Tech (Bay 2)' : 'Drilling Rig Roughneck';
    const confidence = isSIF ? (91 + (idx % 7)) : (84 + (idx % 12));

    return {
      ...r,
      isSIF,
      lsrTag: r.identified_hazard ? lsrAssignment.name : 'Line of Fire',
      lsrCode: lsrAssignment.code,
      confidenceScore: confidence,
      triageStatus: status,
      reporterDept: reporter
    };
  });

  // Filter application
  const filteredReports = enrichedReports.filter((r) => {
    const matchesSearch = 
      !searchTerm ||
      r.report_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.lsrTag?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'ALL' || r.report_type === filterType;
    const matchesSif = 
      filterSif === 'ALL' || 
      (filterSif === 'SIF_YES' && r.isSIF) || 
      (filterSif === 'SIF_NO' && !r.isSIF);
    const matchesLsr = filterLsr === 'ALL' || r.lsrTag === filterLsr || r.lsrCode === filterLsr;
    const matchesSite = filterSite === 'ALL' || r.location?.toLowerCase().includes(filterSite.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || r.triageStatus === filterStatus;

    return matchesSearch && matchesType && matchesSif && matchesLsr && matchesSite && matchesStatus;
  });

  // Bulk Selection Handling
  const handleToggleSelectAll = () => {
    if (selectedIds.size === filteredReports.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredReports.map(r => r.id)));
    }
  };

  const handleToggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkMarkReviewed = () => {
    setBulkActionSuccess(`Successfully marked ${selectedIds.size} reports as REVIEWED`);
    setTimeout(() => setBulkActionSuccess(''), 4000);
    setSelectedIds(new Set());
  };

  const handleBulkEscalate = () => {
    setBulkActionSuccess(`Escalated ${selectedIds.size} high-severity reports to Corporate HSE Committee`);
    setTimeout(() => setBulkActionSuccess(''), 4000);
    setSelectedIds(new Set());
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredReports.length === 0) return;
    const headers = ['Report ID', 'Date', 'Site', 'Department', 'Type', 'SIF Classification', 'Confidence %', 'LSR Rule', 'Status', 'Description'];
    const rows = filteredReports.map(r => [
      `"${r.report_reference || ''}"`,
      `"${r.report_date || ''}"`,
      `"${r.location || ''}"`,
      `"${r.reporterDept || ''}"`,
      `"${r.report_type || ''}"`,
      `"${r.isSIF ? 'SIF POTENTIAL' : 'NON-SIF'}"`,
      `"${r.confidenceScore}%"`,
      `"${r.lsrTag} (${r.lsrCode})"`,
      `"${r.triageStatus}"`,
      `"${(r.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SafetyAI_TriageQueue_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // HSE Save Review in Drawer
  const handleSaveHSEReview = async (e) => {
    e.preventDefault();
    if (!activeDrawerReport) return;

    const newEntry = {
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: 'Barun Borah (HSE Inspector #402)',
      action: `Reviewer set: ${reviewerClassification} | ${isEscalated ? 'ESCALATED TO INVESTIGATION' : 'STATUS CONFIRMED'} | Notes: "${reviewerNotes || 'Reviewed & Verified'}"`
    };

    setAuditLog(prev => [newEntry, ...prev]);
    setAuditSavedMessage('Review decisions & audit trail successfully updated!');
    setTimeout(() => setAuditSavedMessage(''), 4000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto select-none">
      
      {/* 1. Header & Quick Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Inbox className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
              Safety Observation Triage Queue
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Free-text Unsafe Act, Unsafe Condition, and Near-Miss reports parsed by AI/NLP for Serious Injury or Fatality (SIF) potential
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={loadReports}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
            title="Refresh Ingestion Queue"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>

      {/* Bulk Action Alert Banner */}
      {bulkActionSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{bulkActionSuccess}</span>
        </div>
      )}

      {/* 2. Comprehensive Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#090D16] border border-slate-800/90 shadow-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          
          {/* Keyword Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ID, keyword, hazard, site..."
              className="w-full pl-9 pr-3 py-2 bg-[#070A12] text-xs text-slate-200 placeholder-slate-500 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-400/80 font-sans"
            />
          </div>

          {/* Report Type Filter */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 bg-[#070A12] text-xs text-slate-200 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-400/80 cursor-pointer"
            >
              <option value="ALL">All Report Types</option>
              <option value="NEAR_MISS">Near-Miss</option>
              <option value="UNSAFE_ACT">Unsafe Act (UA)</option>
              <option value="UNSAFE_CONDITION">Unsafe Condition (UC)</option>
              <option value="INCIDENT">Incident / Mishap</option>
            </select>
          </div>

          {/* SIF Potential Filter */}
          <div>
            <select
              value={filterSif}
              onChange={(e) => setFilterSif(e.target.value)}
              className="w-full px-3 py-2 bg-[#070A12] text-xs text-amber-400 font-semibold rounded-xl border border-amber-500/30 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="ALL">All Classifications</option>
              <option value="SIF_YES">⚡ SIF-Potential Only</option>
              <option value="SIF_NO">Non-SIF Observations</option>
            </select>
          </div>

          {/* Life-Saving Rule Filter */}
          <div>
            <select
              value={filterLsr}
              onChange={(e) => setFilterLsr(e.target.value)}
              className="w-full px-3 py-2 bg-[#070A12] text-xs text-slate-200 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="ALL">All IOGP Rules (9)</option>
              {IOGP_LIFE_SAVING_RULES.map(r => (
                <option key={r.id} value={r.name}>{r.code}: {r.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-[#070A12] text-xs text-slate-200 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="ALL">All Triage Statuses</option>
              <option value="NEW">New Ingested</option>
              <option value="REVIEWED">Reviewed by HSE</option>
              <option value="ESCALATED">Escalated</option>
            </select>
          </div>

        </div>

        {/* Active Filter Pills & Bulk Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span>Showing <strong>{filteredReports.length}</strong> matching reports (Total: 401)</span>
            {(searchTerm || filterType !== 'ALL' || filterSif !== 'ALL' || filterLsr !== 'ALL' || filterStatus !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('ALL');
                  setFilterSif('ALL');
                  setFilterLsr('ALL');
                  setFilterStatus('ALL');
                }}
                className="text-amber-400 hover:underline font-medium text-[11px] ml-2 cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Bulk Actions */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in">
              <span className="text-amber-400 font-bold font-mono text-[11px]">
                {selectedIds.size} Selected
              </span>
              <button
                onClick={handleBulkMarkReviewed}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold hover:bg-emerald-500/30 transition-all cursor-pointer"
              >
                Mark Reviewed
              </button>
              <button
                onClick={handleBulkEscalate}
                className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-400 border border-red-500/40 text-[11px] font-bold hover:bg-red-500/30 transition-all cursor-pointer"
              >
                Escalate
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Triage Reports Table */}
      <div className="rounded-2xl bg-[#090D16] border border-slate-800/90 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            
            {/* Table Header */}
            <thead>
              <tr className="bg-[#0D1424] border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="p-3.5 w-10 text-center">
                  <button 
                    onClick={handleToggleSelectAll}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    {selectedIds.size === filteredReports.length && filteredReports.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="p-3.5">Report ID & Date</th>
                <th className="p-3.5">Site / Location</th>
                <th className="p-3.5">Dept / Reporter</th>
                <th className="p-3.5 w-72">Free-Text Preview</th>
                <th className="p-3.5">AI SIF Classification</th>
                <th className="p-3.5">Assigned IOGP Rule</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredReports.map((r) => {
                const isSelected = selectedIds.has(r.id);
                return (
                  <tr 
                    key={r.id}
                    onClick={() => handleOpenDrawer(r.id)}
                    className={`hover:bg-slate-850/80 transition-colors cursor-pointer group ${
                      isSelected ? 'bg-amber-500/5' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td 
                      className="p-3.5 text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSelect(r.id);
                      }}
                    >
                      <button className="text-slate-400 hover:text-amber-400 cursor-pointer">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600" />
                        )}
                      </button>
                    </td>

                    {/* Report ID & Date */}
                    <td className="p-3.5 font-mono">
                      <div className="font-bold text-slate-200 group-hover:text-amber-400 transition-colors">
                        {r.report_reference}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {r.report_date}
                      </div>
                    </td>

                    {/* Site Location */}
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-200 truncate max-w-[140px]">
                        {r.location}
                      </div>
                    </td>

                    {/* Reporter Dept */}
                    <td className="p-3.5 text-slate-400 text-[11px]">
                      {r.reporterDept}
                    </td>

                    {/* Free-Text Preview */}
                    <td className="p-3.5 max-w-xs">
                      <p className="line-clamp-2 text-slate-300 leading-relaxed">
                        {r.description}
                      </p>
                    </td>

                    {/* AI Classification & Confidence Badge */}
                    <td className="p-3.5">
                      <div className="flex flex-col items-start gap-1">
                        {r.isSIF ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-black text-[10px] border border-amber-500/40">
                            <CheckCircle2 className="w-3 h-3 text-amber-400" />
                            SIF POTENTIAL
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-medium border border-slate-700">
                            NON-SIF
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 font-mono">
                          {r.confidenceScore}% confidence
                        </span>
                      </div>
                    </td>

                    {/* Life-Saving Rule */}
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono">
                        <span className="text-amber-400 font-bold">{r.lsrCode}</span>
                        <span className="truncate max-w-[110px]">{r.lsrTag}</span>
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.triageStatus === 'NEW'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                          : r.triageStatus === 'REVIEWED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}>
                        {r.triageStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDrawer(r.id);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 text-[11px] font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. SLIDE-OUT REPORT DETAIL PANEL / DRAWER */}
      {activeDrawerReport && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          
          {/* Drawer Backdrop click to dismiss */}
          <div className="flex-1" onClick={handleCloseDrawer} />

          {/* Drawer Container */}
          <div className="w-full max-w-2xl bg-[#090D16] border-l border-slate-800 h-full overflow-y-auto shadow-2xl flex flex-col justify-between text-left p-6 sm:p-8 space-y-6 custom-scrollbar animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div className="space-y-3 pb-4 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-black text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                    {activeDrawerReport.report_reference}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {activeDrawerReport.report_date}
                  </span>
                </div>

                <button
                  onClick={handleCloseDrawer}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h3 className="text-lg font-bold text-white font-heading">
                AI Precursor Analysis & Barrier Evaluation Dossier
              </h3>
              
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{activeDrawerReport.location}</span>
                <span>•</span>
                <span>Type: <strong className="text-slate-200">{activeDrawerReport.report_type}</strong></span>
              </div>
            </div>

            {/* AI Classification & Model Output Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-slate-900 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-mono font-black text-amber-400 uppercase tracking-wider">
                    AI Output: {activeDrawerReport.sif_precursor_assessment === 'YES' ? 'SIF POTENTIAL (FATALITY PRECURSOR)' : 'NON-SIF OBSERVATION'}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-white px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40">
                  94.2% Confidence
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeDrawerReport.ai_analysis?.explanation || 
                 'Potential SIF precursor identified based on high kinetic mass in proximity to unprotected pedestrian walkway without positive barrier containment.'}
              </p>
            </div>

            {/* Free-Text Report with INLINE NLP ENTITY HIGHLIGHTS */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Full Ingested Safety Report Text
                </span>
                <span className="text-[10px] text-amber-400 font-mono">
                  ⚡ Inline NLP Flags Active
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 leading-relaxed space-y-2">
                <div>
                  Worker operating overhead bridge crane in Bay 2 with{' '}
                  <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-semibold border border-red-500/40" title="Barrier Failure">
                    worn wire rope
                  </span>
                  . A{' '}
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40" title="High Energy Vector">
                    2-ton steel beam slipped
                  </span>{' '}
                  during transport and{' '}
                  <span className="px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 font-semibold border border-yellow-500/40" title="Direct Exposure">
                    swung into the designated pedestrian walkway
                  </span>{' '}
                  where two workers were walking.{' '}
                  <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-semibold border border-red-500/40" title="Administrative Barrier Missing">
                    No exclusion zone or spotter was present
                  </span>
                  .
                </div>

                {/* Inline Highlights Legend */}
                <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-2 text-[10px] font-mono">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    High Kinetic Energy
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    Barrier Failure
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                    Direct Exposure
                  </span>
                </div>
              </div>
            </div>

            {/* Extracted Structured Fields & Life-Saving Rule */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Extracted Structured Hazard Fields
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono">IOGP Life-Saving Rule</div>
                  <div className="font-bold text-amber-400 mt-0.5">LSR-04: Safe Mechanical Lifting</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">92% Mapping Confidence</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono">Energy Vector</div>
                  <div className="font-bold text-white mt-0.5">Gravity / Suspended Mass (2,000 kg)</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono">Barrier Failure Type</div>
                  <div className="font-bold text-red-400 mt-0.5">BARRIER_FAILED (Worn Hoist Rope)</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono">Equipment Involved</div>
                  <div className="font-bold text-white mt-0.5">Overhead Bridge Crane & Wire Hoist</div>
                </div>
              </div>
            </div>

            {/* Reviewer Controls: Confirm / Override AI & Add Notes */}
            <form onSubmit={handleSaveHSEReview} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-white font-heading">
                  HSE Reviewer Decisions & Overrides
                </div>
                <span className="text-[10px] text-amber-400 font-mono">Human-in-the-Loop</span>
              </div>

              {auditSavedMessage && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{auditSavedMessage}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[11px] text-slate-400">Classification Override / Confirmation</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewerClassification('SIF_POTENTIAL')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      reviewerClassification === 'SIF_POTENTIAL'
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    Confirm SIF Potential
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewerClassification('NON_SIF')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      reviewerClassification === 'NON_SIF'
                        ? 'bg-slate-700 text-white border-slate-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    Override to Non-SIF
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400">HSE Technical Notes / Action Directives</label>
                <textarea
                  rows={2}
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  placeholder="e.g., Quarantine crane wire hoist rope, schedule NDT testing, reinforce pedestrian exclusion barricades..."
                  className="w-full p-2.5 bg-[#070A12] text-xs text-slate-200 placeholder-slate-500 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <label className="flex items-center gap-2 text-xs text-red-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEscalated}
                    onChange={(e) => setIsEscalated(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-0"
                  />
                  <span>Escalate to Formal Investigation Committee</span>
                </label>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-md shadow-amber-500/20"
                >
                  Save Decisions
                </button>
              </div>
            </form>

            {/* Audit Trail */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                Audit Trail & Review History
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                {auditLog.map((log, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] space-y-0.5">
                    <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                      <span className="text-amber-400 font-bold">{log.user}</span>
                      <span>{log.timestamp}</span>
                    </div>
                    <div className="text-slate-300">{log.action}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
