import React, { useState } from 'react';
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
  FileText
} from 'lucide-react';

export default function BulkUploadView({ onSelectReport, onOpenAllReports }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);

  // Sample batch ingestion records
  const sampleBatchResults = [
    {
      id: 101,
      ref: 'OIL-BATCH-01',
      date: '2026-09-06',
      site: 'Unit 1',
      type: 'NEAR_MISS',
      desc: 'Rotary table spinning chain caught on glove during connection makeup. Drill console emergency brake hit within 1 second.',
      isSIF: true,
      conf: 95.1,
      hazard: 'Kinetic Dynamic Mechanical Hazard'
    },
    {
      id: 102,
      ref: 'OIL-BATCH-02',
      date: '2026-09-06',
      site: 'Unit 2',
      type: 'UNSAFE_CONDITION',
      desc: 'Acetylene cutting cylinder stored horizontally without safety cap in welding staging yard.',
      isSIF: true,
      conf: 91.8,
      hazard: 'Compressed Flammable Gas Cylinder Hazard'
    },
    {
      id: 103,
      ref: 'OIL-BATCH-03',
      date: '2026-09-05',
      site: 'Unit 3',
      type: 'UNSAFE_CONDITION',
      desc: 'Minor oil drip from sample cock valve nipple onto concrete drip pan. Containment intact.',
      isSIF: false,
      conf: 89.2,
      hazard: 'Routine Environmental Housekeeping'
    },
    {
      id: 104,
      ref: 'OIL-BATCH-04',
      date: '2026-09-05',
      site: 'Unit 4',
      type: 'NEAR_MISS',
      desc: 'Contractor scaffold plank shifted 4 inches under worker foot at 6m elevation due to loose tie-wire.',
      isSIF: true,
      conf: 93.6,
      hazard: 'Fall from Elevation (>1.8m)'
    },
    {
      id: 105,
      ref: 'OIL-BATCH-05',
      date: '2026-09-04',
      site: 'Unit 5',
      type: 'UNSAFE_ACT',
      desc: 'Forklift operator driving with empty pallet raised 1.5m off ground during transport across yard.',
      isSIF: false,
      conf: 87.0,
      hazard: 'Vehicle Operation Procedure Deviation'
    }
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadComplete(false);
      setProgress(0);
    }
  };

  const handleSimulateBatchAnalysis = () => {
    if (!selectedFile) {
      // Pick default sample file if none selected
      setSelectedFile({ name: 'OIL_Historical_Safety_Observations_Q3.csv', size: 245000 });
    }

    setIsProcessing(true);
    setProgress(10);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setUploadComplete(true);
          return 100;
        }
        return prev + 18;
      });
    }, 300);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 select-none">
      
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <UploadCloud className="w-5 h-5" />
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-heading">
            Bulk Historical Reports CSV Ingestion
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Upload bulk Unsafe Act, Unsafe Condition, or Near-Miss CSV records to run batch NLP SIF-precursor classification.
        </p>
      </div>

      {/* Drag & Drop Upload Card */}
      <div className="p-8 rounded-2xl bg-white border-2 border-dashed border-slate-300 hover:border-blue-500 transition-colors text-center space-y-4 shadow-xs relative">
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileChange} 
          className="absolute inset-0 opacity-0 cursor-pointer"
        />

        <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
          <FileSpreadsheet className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-900">
            {selectedFile ? selectedFile.name : 'Drag and drop your historical CSV file here'}
          </h3>
          <p className="text-xs text-slate-500">
            {selectedFile 
              ? `${(selectedFile.size / 1024).toFixed(1)} KB • Ready for batch NLP evaluation` 
              : 'or click to browse your computer (standard HSSE fields supported)'}
          </p>
        </div>

        <div className="pt-2 flex justify-center gap-3">
          <button
            type="button"
            onClick={handleSimulateBatchAnalysis}
            disabled={isProcessing}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-sm cursor-pointer flex items-center gap-2"
          >
            {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
            <span>{isProcessing ? 'Processing Batch...' : 'Start Batch AI Analysis'}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {isProcessing && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 animate-in fade-in">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-800">Processing Observations with SafetyAI Pipeline...</span>
            <span className="font-mono font-bold text-blue-600">{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>
      )}

      {/* Batch Processing Results Summary */}
      {uploadComplete && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {/* Summary Stat Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block">Total Ingested</span>
              <strong className="text-2xl font-black text-slate-900 font-mono">150</strong>
            </div>

            <div className="p-4 rounded-xl bg-white border border-amber-300 shadow-xs bg-amber-50/40">
              <span className="text-xs text-amber-800 font-bold block">SIF Precursors Detected</span>
              <strong className="text-2xl font-black text-amber-600 font-mono">36 (24.0%)</strong>
            </div>

            <div className="p-4 rounded-xl bg-white border border-blue-200 shadow-xs bg-blue-50/40">
              <span className="text-xs text-blue-800 font-bold block">Non-SIF Observations</span>
              <strong className="text-2xl font-black text-blue-600 font-mono">114 (76.0%)</strong>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block">Execution Time</span>
              <strong className="text-2xl font-black text-emerald-600 font-mono">1.8s</strong>
            </div>
          </div>

          {/* Table Preview of Ingested Batch */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 font-heading">
                Batch Analysis Sample Preview (Click row to show full dossier)
              </h3>
              <button
                onClick={onOpenAllReports}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <span>View All In Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-mono text-[11px] uppercase tracking-wider">
                    <th className="p-3">Reference</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 w-80">Free-Text Observation</th>
                    <th className="p-3">AI SIF Verdict</th>
                    <th className="p-3">Confidence</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {sampleBatchResults.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => onSelectReport({
                        id: item.id,
                        report_reference: item.ref,
                        report_date: item.date,
                        location: item.site,
                        report_type: item.type,
                        description: item.desc,
                        sif_precursor_assessment: item.isSIF ? 'YES' : 'NO',
                        identified_hazard: item.hazard
                      })}
                      className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                    >
                      <td className="p-3 font-mono font-bold text-blue-600 group-hover:underline">
                        {item.ref}
                      </td>
                      <td className="p-3">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono font-semibold">
                          {item.type}
                        </span>
                      </td>
                      <td className="p-3 max-w-sm">
                        <p className="line-clamp-2 text-slate-600 leading-relaxed">
                          {item.desc}
                        </p>
                      </td>
                      <td className="p-3">
                        {item.isSIF ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-black text-[10px] border border-amber-300">
                            <ShieldAlert className="w-3 h-3 text-amber-600" />
                            SIF POTENTIAL
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold text-[10px] border border-slate-200">
                            NON-SIF
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-700">
                        {item.conf}%
                      </td>
                      <td className="p-3 text-right">
                        <button className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white font-bold text-[11px] transition-all cursor-pointer">
                          Inspect →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
