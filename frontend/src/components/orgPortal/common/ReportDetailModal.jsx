import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Activity, 
  Layers, 
  User, 
  Calendar, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  Check,
  BrainCircuit
} from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function ReportDetailModal({ report, onClose, onUpdateStatus }) {
  const [validationStatus, setValidationStatus] = useState(report?.humanValidation || 'Pending HSSE Review');
  const [explainabilityOpen, setExplainabilityOpen] = useState(true);
  const [capaAction, setCapaAction] = useState('');
  const [savedAction, setSavedAction] = useState(false);

  if (!report) return null;

  const isSif = String(report.sifPotential).toUpperCase().startsWith('YES');

  const handleValidate = (status) => {
    setValidationStatus(status);
    if (onUpdateStatus) onUpdateStatus(report.id, status);
  };

  const handleSaveCapa = (e) => {
    e.preventDefault();
    if (!capaAction.trim()) return;
    setSavedAction(true);
    setTimeout(() => setSavedAction(false), 3000);
    setCapaAction('');
  };

  const whyFlagged = report.whyAiFlagged || {
    highEnergy: 'High-energy operational hazard identified above human tolerance threshold.',
    barrierConcern: 'Physical or automated barrier was compromised, degraded, or omitted.',
    consequence: 'Direct worker exposure within the unmitigated line-of-fire.'
  };

  const safetyIntel = report.safetyIntelligence || {
    hazard: report.hazard || 'Operational High-Energy Hazard',
    exposure: 'Field personnel working within proximity boundary',
    precursor: 'Identified abnormal precursor signal',
    criticalControl: report.failedBarrier || 'Primary Engineered Barrier',
    controlFailure: report.barrierStatus || 'BARRIER_FAILED'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#0d121c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Top Header Bar */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-white/[0.08] bg-[#111724]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono font-bold text-amber-400">{report.id}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300 font-medium">{report.activity}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">{report.date}</span>
              <span className="text-slate-500">•</span>
              <StatusBadge status={report.status} />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight font-heading">
              {report.title}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{report.location}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body: Progressive Disclosure */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-200">
          
          {/* 1. AI Assessment: SIF Potential YES/NO & Confidence */}
          <div className="p-4 rounded-xl bg-[#141b29] border border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl border ${
                isSif 
                  ? 'bg-red-500/15 border-red-500/30 text-red-400' 
                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
              }`}>
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-mono font-bold block">
                  AI SIF Potential Assessment
                </span>
                <span className="text-sm font-bold text-white">
                  SIF Potential: <span className={isSif ? 'text-red-400' : 'text-emerald-400'}>{report.sifPotential}</span>
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400 block font-mono">Model Confidence</span>
              <span className="text-base font-bold font-mono text-amber-400">{report.confidence}%</span>
            </div>
          </div>

          {/* 2. Why AI Flagged It */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
              Why AI Flagged This Event
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-[#111724] border border-white/[0.06] space-y-1">
                <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">
                  High-Energy Exposure
                </span>
                <p className="text-xs text-slate-200 leading-snug">
                  {whyFlagged.highEnergy}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#111724] border border-white/[0.06] space-y-1">
                <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">
                  Barrier / Control Concern
                </span>
                <p className="text-xs text-slate-200 leading-snug">
                  {whyFlagged.barrierConcern}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#111724] border border-white/[0.06] space-y-1">
                <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">
                  Potential Consequence
                </span>
                <p className="text-xs text-slate-200 leading-snug">
                  {whyFlagged.consequence}
                </p>
              </div>
            </div>
          </div>

          {/* 3. Safety Intelligence Structured Grid */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              Safety Intelligence Breakdown
            </h3>

            <div className="p-4 rounded-xl bg-[#111724] border border-white/[0.06] space-y-2.5">
              <div className="grid grid-cols-2 gap-3 pb-2.5 border-b border-white/[0.04]">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Identified Hazard:</span>
                  <p className="font-semibold text-white mt-0.5">{safetyIntel.hazard}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Worker Exposure:</span>
                  <p className="font-semibold text-white mt-0.5">{safetyIntel.exposure}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Precursor Signal:</span>
                  <p className="font-medium text-amber-300 mt-0.5">{safetyIntel.precursor}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Critical Control:</span>
                  <p className="font-medium text-white mt-0.5">{safetyIntel.criticalControl}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Control Failure State:</span>
                  <p className="font-mono text-red-400 font-bold mt-0.5">{safetyIntel.controlFailure}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 4. AI Evidence & Explainability (Collapsible) */}
          <div className="rounded-xl bg-[#111724] border border-white/[0.06] overflow-hidden">
            <button
              onClick={() => setExplainabilityOpen(!explainabilityOpen)}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white text-xs">AI Evidence & Explainability</span>
              </div>
              {explainabilityOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {explainabilityOpen && (
              <div className="p-4 pt-0 border-t border-white/[0.04] space-y-2 text-xs text-slate-300">
                <p className="leading-relaxed">
                  The model analyzed the narrative and extracted energy descriptors matching the <strong>IOGP High-Energy Matrix</strong>.
                  Multiple correlating precursor flags were matched across related reports in this asset cluster within the last 60 days.
                </p>
                <div className="p-3 rounded-lg bg-black/40 border border-white/[0.04] text-[11px] font-mono space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Energy Magnitude:</span>
                    <span className="text-white font-bold">High (Exceeds 1.8m height / &gt;150 PSI line)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Barrier Integrity:</span>
                    <span className="text-red-400 font-bold">Compromised</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Automated Recommendation:</span>
                    <span className="text-amber-400">Physical verification required</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 5. Safety Expert Review (Human Validation) */}
          <div className="p-4 rounded-xl bg-[#141b29] border border-amber-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Safety Expert Review & Human Validation</h4>
                <p className="text-[11px] text-slate-400">
                  AI assists triage — final operational determination rests with the HSSE Lead.
                </p>
              </div>
              <span className="font-mono text-amber-400 font-bold text-[11px] bg-amber-500/10 px-2 py-0.5 rounded">
                Status: {validationStatus}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => handleValidate('Confirmed SIF Precursor')}
                className="px-3 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800/60 font-semibold text-xs transition-colors cursor-pointer"
              >
                Confirm SIF Precursor
              </button>
              <button
                onClick={() => handleValidate('Downgraded to Routine Hazard')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Downgrade (Routine)
              </button>
              <button
                onClick={() => handleValidate('Investigation Closed')}
                className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60 font-semibold text-xs transition-colors cursor-pointer"
              >
                Close Investigation
              </button>
            </div>

            {/* CAPA action */}
            <form onSubmit={handleSaveCapa} className="pt-2 border-t border-white/[0.04] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Assign Corrective Action (CAPA):</span>
                {savedAction && (
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                    <Check className="w-3.5 h-3.5" /> Action assigned.
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={capaAction}
                  onChange={(e) => setCapaAction(e.target.value)}
                  placeholder="Specify immediate engineering barrier fix..."
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Assign
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-white/[0.08] bg-[#111724]">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
