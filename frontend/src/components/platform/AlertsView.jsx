import React, { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  UserCheck, 
  MapPin, 
  Clock, 
  ArrowRight, 
  Layers, 
  Check,
  Filter,
  UserPlus
} from 'lucide-react';
import { ALERTS_LIST } from '../../data/platformData';

export default function AlertsView({ onInspectReport }) {
  const [alerts, setAlerts] = useState(ALERTS_LIST);
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [assigningAlertId, setAssigningAlertId] = useState(null);
  const [assigneeName, setAssigneeName] = useState('Rajiv Sharma (Rig HSE Lead)');
  const [toastMessage, setToastMessage] = useState('');

  const hseOfficers = [
    'Rajiv Sharma (Rig HSE Lead)',
    'Barun Borah (Head of Drilling Safety)',
    'Sunil Gogoi (Maintenance & Fab Lead)',
    'Mousumi Phukan (Production Safety)',
    'Pranjal Das (Pipelines & Logistics)'
  ];

  const handleAcknowledge = (id) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, status: 'ACKNOWLEDGED' };
      }
      return a;
    }));
    setToastMessage(`Alert ${id} acknowledged by HSE team`);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleAssign = (id) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, status: 'ASSIGNED', assignedTo: assigneeName };
      }
      return a;
    }));
    setAssigningAlertId(null);
    setToastMessage(`Alert ${id} assigned to ${assigneeName}`);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const filteredAlerts = alerts.filter(a => {
    if (filterSeverity === 'ALL') return true;
    return a.severity === filterSeverity;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto select-none">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Bell className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
              Real-Time Automated Safety Alerts
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Auto-generated when: new SIF reports ingest, sites cross density thresholds, or precursor patterns repeat
          </p>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Severity:</span>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-1.5 bg-[#090D16] text-xs text-slate-200 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="ALL">All Severities ({alerts.length})</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Priority</option>
            <option value="MODERATE">Moderate</option>
          </select>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. Alert Cards Stream */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => {
          const isCritical = alert.severity === 'CRITICAL';
          const isAssigned = alert.status === 'ASSIGNED';
          const isAcknowledged = alert.status === 'ACKNOWLEDGED';

          return (
            <div
              key={alert.id}
              className={`p-5 rounded-2xl bg-[#090D16] border transition-all duration-200 shadow-xl space-y-4 ${
                isCritical ? 'border-red-500/30 hover:border-red-500/50' : 'border-slate-800/90 hover:border-amber-500/40'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                      isCritical ? 'bg-red-500/15 text-red-400 border-red-500/40' : 'bg-amber-500/15 text-amber-400 border-amber-500/40'
                    }`}>
                      {alert.severity} TRIGGER
                    </span>

                    <span className="text-xs font-mono font-bold text-slate-300">
                      {alert.category}
                    </span>

                    <span className="text-[11px] text-slate-500 font-mono">
                      • {alert.time} ({alert.date})
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white font-heading mt-1">
                    {alert.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {alert.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1 font-mono">
                    <span className="flex items-center gap-1 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      {alert.sourceSite}
                    </span>
                    <span className="text-amber-400">
                      ⚡ IOGP: {alert.linkedRule}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="shrink-0 flex sm:flex-col items-end gap-1">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
                    alert.status === 'ACTIVE' 
                      ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse' 
                      : alert.status === 'ASSIGNED'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {alert.status}
                  </span>
                  {alert.assignedTo && (
                    <span className="text-[10px] text-slate-400 font-mono truncate max-w-[160px]">
                      👤 {alert.assignedTo}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Directive */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-slate-200">
                  <strong className="text-amber-400">Required Action: </strong>
                  {alert.actionRequired}
                </span>
              </div>

              {/* Footer Actions: Acknowledge & Assign */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {/* Acknowledge Button */}
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    disabled={isAcknowledged}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isAcknowledged 
                        ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isAcknowledged ? 'Acknowledged' : 'Acknowledge'}</span>
                  </button>

                  {/* Assign To Button */}
                  <button
                    onClick={() => setAssigningAlertId(assigningAlertId === alert.id ? null : alert.id)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                    <span>Assign Officer</span>
                  </button>
                </div>

                <button
                  onClick={() => onInspectReport && onInspectReport(8)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>Inspect Linked Reports</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Assigning Dropdown Modal Inline */}
              {assigningAlertId === alert.id && (
                <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/40 animate-in fade-in space-y-3">
                  <div className="text-xs font-bold text-white">Assign HSE Lead Officer:</div>
                  <div className="flex items-center gap-2">
                    <select
                      value={assigneeName}
                      onChange={(e) => setAssigneeName(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-[#070A12] text-xs text-slate-200 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-400"
                    >
                      {hseOfficers.map((off, idx) => (
                        <option key={idx} value={off}>{off}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleAssign(alert.id)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold cursor-pointer"
                    >
                      Confirm Assignment
                    </button>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}
