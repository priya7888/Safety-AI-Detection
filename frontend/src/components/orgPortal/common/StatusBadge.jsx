import React from 'react';

export default function StatusBadge({ status, type = 'status' }) {
  if (type === 'sif') {
    const isYes = String(status).toUpperCase().startsWith('YES');
    return (
      <span className={`inline-flex items-center gap-1.5 font-bold text-xs ${
        isYes ? 'text-red-400' : 'text-slate-400'
      }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${isYes ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`} />
        {status}
      </span>
    );
  }

  if (type === 'risk') {
    const lower = String(status).toLowerCase();
    if (lower.includes('high') || lower.includes('elevated')) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 mr-1.5" />
          {status}
        </span>
      );
    }
    if (lower.includes('med') || lower.includes('moderate')) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5" />
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-yellow-500/15 text-yellow-300 border border-yellow-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mr-1.5" />
        {status}
      </span>
    );
  }

  // Default Status Badges: Investigate, Reviewed, In Progress, Closed
  const lowerStatus = String(status).toLowerCase();
  
  if (lowerStatus === 'investigate') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-red-950/60 text-red-400 border border-red-800/60 shadow-sm shadow-red-950/40">
        Investigate
      </span>
    );
  }
  if (lowerStatus === 'reviewed') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-sky-950/60 text-sky-400 border border-sky-800/60 shadow-sm shadow-sky-950/40">
        Reviewed
      </span>
    );
  }
  if (lowerStatus === 'in progress') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 shadow-sm shadow-emerald-950/40">
        In Progress
      </span>
    );
  }
  if (lowerStatus === 'closed') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-800/80 text-slate-400 border border-slate-700/60">
        Closed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
      {status}
    </span>
  );
}
