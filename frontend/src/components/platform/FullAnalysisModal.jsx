import React from 'react';
import { 
  X, 
  ShieldAlert, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  FileText,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Shield,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function FullAnalysisModal({ report, onClose }) {
  if (!report) return null;

  const isSIF = report.sif_precursor_assessment === 'YES' || report.isSIF;
  const analysis = report.ai_analysis || {};
  const hazard = report.identified_hazard || analysis.identified_hazard || 'Hazard Assessment Completed';
  const energy = analysis.energy_source || report.energy_source || 'Identified Energy Vector';
  const barrier = report.barrier_status || report.barrier_information || analysis.barrier_information || 'Critical Barrier Audited';
  const explanation = analysis.explanation || report.brief_explanation || report.explanation || 'AI analysis completed based on industrial safety precursor signals.';
  const recommendation = report.recommended_action || analysis.recommended_action || 'Enforce physical controls and verify critical barrier integrity.';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200 select-none">
      
      {/* Modal Dialog */}
      <div className="w-full max-w-3xl bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white overflow-hidden flex flex-col max-h-[92vh] text-left">
        
        {/* Top Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white flex items-start justify-between gap-4 shadow-md">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-xs font-black px-3 py-1 rounded-xl bg-white/20 text-white border border-white/30 backdrop-blur-md shadow-2xs">
                {report.report_reference || `REP-${report.id}`}
              </span>
              {report.report_date && (
                <span className="text-xs text-blue-100 font-mono flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{report.report_date}</span>
                </span>
              )}
              {report.report_type && (
                <span className="text-xs px-2.5 py-0.5 rounded-lg bg-white/15 text-white font-semibold">
                  {report.report_type}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-heading">
              AI Safety Intelligence & Causal Analysis
            </h2>
            <p className="text-xs text-blue-100 font-medium">
              SIF Precursor Assessment Engine • Oil India Limited
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer border border-white/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-6 text-slate-800">
          
          {/* 1. SIF Potential Verdict Banner */}
          <div className={`p-5 rounded-2xl border flex items-center justify-between gap-4 shadow-xs ${
            isSIF 
              ? 'bg-amber-50/90 border-amber-300 text-amber-950' 
              : 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
          }`}>
            <div className="flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                isSIF ? 'bg-gradient-to-tr from-amber-500 to-rose-500 text-white' : 'bg-gradient-to-tr from-emerald-500 to-teal-600 text-white'
              }`}>
                {isSIF ? <ShieldAlert className="w-6 h-6 stroke-[2.2]" /> : <ShieldCheck className="w-6 h-6 stroke-[2.2]" />}
              </div>
              <div>
                <div className="text-xs font-mono font-black uppercase tracking-wider">
                  {isSIF ? 'POTENTIAL SIF PRECURSOR DETECTED' : 'NON-SIF OBSERVATION'}
                </div>
                <div className="text-base sm:text-lg font-black mt-0.5">
                  {isSIF ? 'High Energy Release & Critical Fatality Risk' : 'Contained Observation / Low Energy'}
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className={`text-xs font-mono font-black px-3 py-1.5 rounded-xl border shadow-2xs ${
                isSIF ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-emerald-100 border-emerald-300 text-emerald-900'
              }`}>
                {isSIF ? 'SIF PRECURSOR' : 'NON-SIF'}
              </span>
            </div>
          </div>

          {/* 2. Full Submitted Observation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-black text-slate-700 font-mono uppercase tracking-wider">
                Submitted Safety Observation
              </span>
              {report.location && (
                <span className="text-slate-600 text-xs font-mono flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>{report.location}</span>
                </span>
              )}
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 text-sm leading-relaxed text-slate-800">
              <p className="font-medium">
                {report.description || 'No observation description recorded.'}
              </p>
            </div>
          </div>

          {/* 3. Structured Hazard, Energy Vector & Barrier Audit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] text-slate-400 font-mono font-bold block uppercase tracking-wider">IDENTIFIED HAZARD</span>
              <strong className="text-slate-900 block font-heading text-sm sm:text-base">
                {hazard}
              </strong>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] text-slate-400 font-mono font-bold block uppercase tracking-wider">ENERGY SOURCE</span>
              <strong className="text-amber-700 block font-heading text-sm sm:text-base flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{energy}</span>
              </strong>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] text-slate-400 font-mono font-bold block uppercase tracking-wider">BARRIER STATUS</span>
              <strong className="text-slate-900 block font-heading text-sm sm:text-base flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{barrier?.replace?.('_', ' ') || barrier}</span>
              </strong>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] text-slate-400 font-mono font-bold block uppercase tracking-wider">CLASSIFICATION VECTOR</span>
              <strong className="text-blue-700 block font-heading text-sm sm:text-base">
                {report.report_type || 'Industrial Incident'}
              </strong>
            </div>
          </div>

          {/* 4. SafetyAI Recommended Action */}
          <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 border border-blue-200/90 text-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-black text-blue-900 font-mono uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>SafetyAI Corrective Recommendation</span>
            </div>
            <p className="text-sm font-bold text-slate-900 leading-relaxed">
              {recommendation}
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            SafetyAI Engine • SIH PS 165
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-black transition-all cursor-pointer shadow-md shadow-blue-600/20"
          >
            Close Details
          </button>
        </div>

      </div>
    </div>
  );
}
