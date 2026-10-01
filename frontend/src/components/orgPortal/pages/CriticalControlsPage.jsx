import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  X, 
  Check, 
  MapPin, 
  Calendar, 
  Activity, 
  Sliders
} from 'lucide-react';
import PageHeader from '../common/PageHeader';
import { MOCK_CRITICAL_CONTROLS } from '../data/mockData';

export default function CriticalControlsPage() {
  const [controls, setControls] = useState(MOCK_CRITICAL_CONTROLS);
  const [selectedControl, setSelectedControl] = useState(null);
  const [assignedActionNote, setAssignedActionNote] = useState('');
  const [assignedSuccess, setAssignedSuccess] = useState(false);

  const handleAssignAction = (e) => {
    e.preventDefault();
    if (!assignedActionNote.trim()) return;
    setAssignedSuccess(true);
    setTimeout(() => {
      setAssignedSuccess(false);
      setAssignedActionNote('');
    }, 2500);
  };

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      
      {/* Page Header */}
      <PageHeader
        title="Critical Controls"
        subtitle="Monitor the health and reliability of critical safety barriers."
        badge="42 Monitored Barriers"
      />

      {/* Top 4 KPI Cards Only */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0f141e] border border-white/[0.08] shadow-lg">
          <span className="text-xs text-slate-400 font-medium">Controls Monitored</span>
          <div className="text-3xl font-bold text-white mt-1.5 font-sans">42</div>
          <span className="text-[11px] text-slate-400 font-mono mt-1 block">Plant & Rig Wide</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f141e] border border-emerald-500/20 shadow-lg">
          <span className="text-xs text-emerald-400 font-medium">Healthy Controls</span>
          <div className="text-3xl font-bold text-emerald-400 mt-1.5 font-sans">31</div>
          <span className="text-[11px] text-emerald-400 font-mono mt-1 block">Operating Within Tolerance</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f141e] border border-amber-500/20 shadow-lg">
          <span className="text-xs text-amber-400 font-medium">Attention Required</span>
          <div className="text-3xl font-bold text-amber-400 mt-1.5 font-sans">7</div>
          <span className="text-[11px] text-amber-400 font-mono mt-1 block">Degradation Detected</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f141e] border border-red-500/20 shadow-lg">
          <span className="text-xs text-red-400 font-medium">Controls Failed</span>
          <div className="text-3xl font-bold text-red-400 mt-1.5 font-sans">4</div>
          <span className="text-[11px] text-red-400 font-mono mt-1 block">Barrier Compromised</span>
        </div>
      </div>

      {/* Clean Grid of Critical Control Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white tracking-wide font-heading uppercase">
            OPERATIONAL BARRIER STATUS
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Click 'View' for detailed barrier assurance
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {controls.map((ctrl) => {
            const isFailed = ctrl.status === 'Failed';
            const isAttention = ctrl.status === 'Attention Required';
            const barColor = isFailed ? 'bg-red-500' : isAttention ? 'bg-amber-500' : 'bg-emerald-500';
            const statusBadgeClass = isFailed
              ? 'bg-red-500/15 text-red-400 border-red-500/30'
              : isAttention
              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';

            return (
              <div
                key={ctrl.id}
                className="p-5 rounded-2xl bg-[#0f141e] border border-white/[0.08] hover:border-white/20 transition-all flex flex-col justify-between space-y-3.5 shadow-lg"
              >
                <div>
                  {/* Status Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-bold text-amber-400">{ctrl.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${statusBadgeClass}`}>
                      {ctrl.status}
                    </span>
                  </div>

                  {/* Control Name */}
                  <h3 className="text-sm font-bold text-white leading-snug">
                    {ctrl.name}
                  </h3>
                </div>

                {/* Progress bar and effectiveness */}
                <div className="space-y-1.5 pt-2 border-t border-white/[0.04]">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Control Effectiveness:</span>
                    <span className="font-mono font-bold text-white">{ctrl.effectiveness}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${ctrl.effectiveness}%` }} />
                  </div>
                </div>

                {/* Related reports and last review */}
                <div className="space-y-1 text-xs text-slate-400">
                  <p className="text-amber-300/90 font-medium font-mono text-[11px]">
                    {ctrl.relatedReportsCount} related SIF-potential reports
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Last review: <span className="text-slate-400">{ctrl.lastReview}</span>
                  </p>
                </div>

                {/* Card Action */}
                <div className="pt-2 border-t border-white/[0.04] flex justify-end">
                  <button
                    onClick={() => setSelectedControl(ctrl)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 transition-all text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Detail</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Control Detail Modal */}
      {selectedControl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-[#0d121c] border border-white/10 rounded-2xl shadow-2xl p-6 space-y-5 my-auto max-h-[90vh] overflow-y-auto text-xs text-slate-300">
            
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400">{selectedControl.id}</span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {selectedControl.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedControl(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status & Effectiveness Summary */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[#121826] border border-white/[0.06]">
              <div>
                <span className="text-slate-400 block font-mono text-[10px]">CURRENT STATUS</span>
                <span className={`text-sm font-bold mt-1 inline-block ${
                  selectedControl.status === 'Failed' 
                    ? 'text-red-400' 
                    : selectedControl.status === 'Attention Required' 
                    ? 'text-amber-400' 
                    : 'text-emerald-400'
                }`}>
                  {selectedControl.status}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-mono text-[10px]">EFFECTIVENESS SCORE</span>
                <span className="text-sm font-bold font-mono text-white mt-1 inline-block">
                  {selectedControl.effectiveness}% Verified
                </span>
              </div>
            </div>

            {/* Content Sections */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-[#121826] border border-white/[0.06] space-y-1">
                <span className="font-bold text-amber-400 block font-mono uppercase text-[10px]">
                  Related SIF Patterns:
                </span>
                <p className="text-white font-medium">{selectedControl.relatedSifPattern}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#121826] border border-white/[0.06] space-y-1">
                <span className="font-bold text-slate-400 block font-mono uppercase text-[10px]">
                  Affected Locations:
                </span>
                <p className="text-white font-medium">{selectedControl.affectedLocations}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#121826] border border-white/[0.06] space-y-1">
                <span className="font-bold text-slate-400 block font-mono uppercase text-[10px]">
                  Recent Field Evidence:
                </span>
                <p className="text-slate-200 leading-relaxed">{selectedControl.recentEvidence}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#141b29] border border-amber-500/20 space-y-1">
                <span className="font-bold text-amber-400 block font-mono uppercase text-[10px]">
                  Recommended Engineering Action:
                </span>
                <p className="text-slate-200 font-medium">{selectedControl.recommendedAction}</p>
              </div>
            </div>

            {/* Assign Action Form */}
            <form onSubmit={handleAssignAction} className="pt-3 border-t border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold text-[11px]">Assign Remediation Action:</span>
                {assignedSuccess && (
                  <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Action assigned to field lead.
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={assignedActionNote}
                  onChange={(e) => setAssignedActionNote(e.target.value)}
                  placeholder="Specify barrier re-certification or maintenance task..."
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Assign Action
                </button>
              </div>
            </form>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedControl(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
