import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  Filter, 
  Activity, 
  Flame, 
  Zap, 
  X,
  Layers,
  FileCheck
} from 'lucide-react';
import { getStoreState, subscribeSafetyStore } from '../../services/safetyStore';

export default function AlertsView() {
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [investigatingAlert, setInvestigatingAlert] = useState(null);
  const [investigationNotes, setInvestigationNotes] = useState('');
  const [investigationStatus, setInvestigationStatus] = useState('UNDER_INVESTIGATION');
  const [investigationSuccess, setInvestigationSuccess] = useState(false);

  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const updateFromStore = (state) => {
      const reps = state?.reports || [];
      const sifReports = reps.filter(r => r.sif_precursor_assessment === 'YES' || r.risk_level === 'Critical' || (r.ai_score && r.ai_score >= 80));
      const mapped = sifReports.map((r, i) => ({
        id: r.report_reference || `ALT-${String(i + 1).padStart(3, '0')}`,
        severity: (r.risk_level === 'Critical' || (r.ai_score && r.ai_score >= 90)) ? 'CRITICAL' : 'HIGH',
        title: r.identified_hazard || r.description || 'Precursor Finding',
        location: r.location || 'Unit 1',
        facility_unit: r.facility_unit || r.location || 'Operating Area',
        riskScore: r.ai_score || 85,
        timeAgo: r.report_date || 'Today',
        timestamp: r.report_date || 'Today',
        status: r.status === 'Resolved' ? 'Resolved' : 'Action Required',
        description: r.description,
        hazard_type: r.identified_hazard || 'Operational Safety Finding',
        barrier: r.barrier_status || 'Barrier Integrity Audit Pending',
        action_needed: r.recommended_action || 'Immediate physical inspection and barrier enforcement required.'
      }));
      setAlerts(mapped);
    };

    updateFromStore(getStoreState());
    const unsub = subscribeSafetyStore(updateFromStore);
    return unsub;
  }, []);

  const filteredAlerts = alerts.filter((alert) => {
    if (filterSeverity === 'CRITICAL' && alert.severity !== 'CRITICAL') return false;
    if (filterSeverity === 'HIGH' && alert.severity !== 'HIGH') return false;
    if (filterSeverity === 'ACTION' && alert.status !== 'Action Required') return false;
    return true;
  });

  const handleSaveInvestigation = () => {
    if (!investigatingAlert) return;
    setAlerts(prev => prev.map(a => 
      a.id === investigatingAlert.id ? { ...a, status: 'Resolved' } : a
    ));
    setInvestigationSuccess(true);
    setTimeout(() => {
      setInvestigationSuccess(false);
      setInvestigatingAlert(null);
      setInvestigationNotes('');
    }, 800);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto text-slate-800 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#EAE6E1]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-xs">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 tracking-tight">
              Critical Alert Command Center
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 ml-12">
            Real-time escalation console for high-energy precursor events requiring immediate control room intervention
          </p>
        </div>

        {/* Severity Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: 'ALL', label: 'All Alerts' },
            { id: 'CRITICAL', label: 'Critical Only' },
            { id: 'HIGH', label: 'High Only' },
            { id: 'ACTION', label: 'Action Required' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setFilterSeverity(pill.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                filterSeverity === pill.id
                  ? 'bg-[#FFF1EE] text-[#FF5A36] border-[#FFE0D6] font-bold shadow-xs'
                  : 'bg-white text-slate-600 border-[#EAE6E1] hover:bg-[#FAF8F5]'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Feed Cards */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border-2 border-dashed border-stone-200 text-xs text-slate-500 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF5A36] flex items-center justify-center mx-auto border border-orange-200">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <p className="font-bold text-slate-800 text-base">No Active Critical Safety Alerts</p>
            <p className="text-slate-500 max-w-md mx-auto text-xs">
              Alerts are dynamically triggered when high-energy SIF precursors, barrier compromises, or critical safety findings are identified in reports.
            </p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 text-xs text-slate-500 space-y-2">
            <p className="font-semibold text-slate-700 text-sm">No alerts found matching the selected filter.</p>
            <button
              type="button"
              onClick={() => setFilterSeverity('ALL')}
              className="mt-2 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold cursor-pointer"
            >
              Show All Alerts
            </button>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div 
              key={alert.id}
              className={`p-6 rounded-2xl bg-white border transition-all duration-200 shadow-xs hover:shadow-md space-y-4 ${
                alert.severity === 'CRITICAL' 
                  ? 'border-rose-200 hover:border-rose-300' 
                  : 'border-amber-200 hover:border-amber-300'
              }`}
            >
              
              {/* Top Alert Header Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                    alert.severity === 'CRITICAL' 
                      ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                      : 'bg-amber-50 text-amber-600 border border-amber-200'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${alert.severity === 'CRITICAL' ? 'bg-rose-500 animate-ping' : 'bg-amber-500'}`} />
                    {alert.severity}
                  </span>

                  <span className="font-mono text-xs font-bold text-slate-700 bg-[#FAF8F5] px-2.5 py-0.5 rounded-md border border-[#EAE6E1]">
                    {alert.id}
                  </span>

                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#FF5A36]" />
                    {alert.location} • {alert.facility_unit}
                  </span>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Risk Score</span>
                    <div className={`text-base font-black font-mono ${alert.severity === 'CRITICAL' ? 'text-rose-600' : 'text-amber-600'}`}>
                      {alert.riskScore} / 100
                    </div>
                  </div>

                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {alert.timeAgo}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  "{alert.title}"
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-2 bg-[#FAF8F5] p-3.5 rounded-xl border border-[#EAE6E1]">
                  {alert.description}
                </p>
              </div>

              {/* Telemetry Detail Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6E1]">
                  <span className="text-[10px] uppercase font-bold text-[#FF5A36] font-mono block">Hazard Vector</span>
                  <span className="text-slate-800 font-medium">{alert.hazard_type}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-100">
                  <span className="text-[10px] uppercase font-bold text-rose-600 font-mono block">Barrier Integrity Audit</span>
                  <span className="text-rose-700 font-medium">{alert.barrier}</span>
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Status:</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                    alert.status === 'Resolved' 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                      : alert.status === 'Action Required'
                        ? 'bg-rose-50 text-rose-600 border border-rose-200'
                        : 'bg-amber-50 text-amber-600 border border-amber-200'
                  }`}>
                    {alert.status}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-[11px] hidden md:inline">
                    Action: {alert.action_needed}
                  </span>

                  <button
                    type="button"
                    onClick={() => setInvestigatingAlert(alert)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF6B4A] to-[#FF5A36] hover:from-[#FF5A36] hover:to-[#E04826] text-white font-bold text-xs shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Investigate & Verify Barrier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Investigation Modal */}
      {investigatingAlert && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 select-none animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-[#EAE6E1] shadow-2xl p-6 space-y-5 text-left text-slate-800">
            
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-bold text-slate-900">
                  Investigate Precursor: {investigatingAlert.id}
                </h3>
              </div>
              <button 
                onClick={() => setInvestigatingAlert(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6E1] text-xs space-y-1">
              <div className="font-bold text-slate-900">{investigatingAlert.title}</div>
              <div className="text-slate-500">{investigatingAlert.location} • {investigatingAlert.hazard_type}</div>
            </div>

            <div className="space-y-3 text-xs">
              <span className="font-bold uppercase tracking-wider text-[#FF5A36] block">
                Barrier Verification Checklist
              </span>
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6E1] cursor-pointer hover:bg-white transition-colors">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-[#FF5A36]" />
                <span className="text-slate-700">Primary energy isolation confirmed at zero potential.</span>
              </label>
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6E1] cursor-pointer hover:bg-white transition-colors">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-[#FF5A36]" />
                <span className="text-slate-700">Physical exclusion zone barricade erected and spotter assigned.</span>
              </label>
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6E1] cursor-pointer hover:bg-white transition-colors">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-[#FF5A36]" />
                <span className="text-slate-700">Chief HSE Lead audited permit-to-work compliance.</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Control Room Log Notes
              </label>
              <textarea
                rows={3}
                value={investigationNotes}
                onChange={(e) => setInvestigationNotes(e.target.value)}
                placeholder="Document remedial barriers deployed, root causes identified, and supervisor sign-off..."
                className="w-full p-3 rounded-xl bg-[#FAF8F5] border border-stone-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#FF5A36]"
              />
            </div>

            {investigationSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Barrier verified. Precursor status updated to Resolved.</span>
              </div>
            )}

            <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setInvestigatingAlert(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveInvestigation}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B4A] to-[#FF5A36] hover:from-[#FF5A36] hover:to-[#E04826] text-white font-bold text-xs shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Sign Off & Resolve Alert</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
