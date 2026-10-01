import React, { useState } from 'react';
import { 
  Layers, 
  AlertTriangle, 
  ShieldAlert, 
  ArrowRight, 
  ChevronRight, 
  Filter, 
  Activity, 
  MapPin, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  Zap,
  Sparkles,
  Flame,
  Radio
} from 'lucide-react';
import { PRECURSOR_PATTERNS } from '../../data/platformData';

export default function PrecursorPatternsView({ onViewPatternReports }) {
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedPattern, setSelectedPattern] = useState(null);

  const filteredPatterns = PRECURSOR_PATTERNS.filter(p => {
    if (selectedSeverity === 'ALL') return true;
    return p.severity === selectedSeverity;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto select-none">
      
      {/* 1. Header & Pattern Mining Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Layers className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
              Recurring Precursor Pattern Mining
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Answering <em className="text-slate-200">"what keeps almost happening before something serious"</em> by clustering Activity × Location × Barrier Failure
          </p>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Severity:</span>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-1.5 bg-[#090D16] text-xs text-slate-200 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="ALL">All Patterns ({PRECURSOR_PATTERNS.length})</option>
            <option value="CRITICAL">Critical Severity</option>
            <option value="HIGH">High Severity</option>
            <option value="MODERATE">Moderate</option>
          </select>
        </div>
      </div>

      {/* 2. Interactive Precursor Network / Cluster Relationship Matrix */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0C1524] via-[#0D182E] to-[#0A101C] border border-slate-800/90 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
            <h3 className="text-sm font-bold text-white font-heading">
              Precursor Relationship Cluster Graph (Activity ➔ Barrier Failure ➔ Potential SIF)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-amber-400">Real-Time Graph Triangulation</span>
        </div>

        {/* Visual Cluster Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          {/* Cluster Node 1 */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-red-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-red-400 font-bold text-[10px]">CLUSTER #01 • 9 OCCURRENCES</span>
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
            </div>
            <div className="font-bold text-white text-xs">
              Rig Mast Transition ➔ Dual Lanyard Unclip ➔ 15m Fall Hazard
            </div>
            <div className="text-[11px] text-slate-400">
              Primary Sites: <strong className="text-slate-300">Bay 2 Fab & Rig Mast 7</strong>
            </div>
            <div className="flex items-center gap-2 pt-1 font-mono text-[10px] text-amber-400">
              <span>LSR-03: Working at Height</span>
              <span>•</span>
              <span>+45% Velocity</span>
            </div>
          </div>

          {/* Cluster Node 2 */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-amber-400 font-bold text-[10px]">CLUSTER #02 • 7 OCCURRENCES</span>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            </div>
            <div className="font-bold text-white text-xs">
              Overhead Crane Hoist ➔ Frayed Rigging ➔ Walkway Incursion
            </div>
            <div className="text-[11px] text-slate-400">
              Primary Sites: <strong className="text-slate-300">Bay 2 Heavy Fab & Drill Yard</strong>
            </div>
            <div className="flex items-center gap-2 pt-1 font-mono text-[10px] text-amber-400">
              <span>LSR-04: Safe Mechanical Lifting</span>
              <span>•</span>
              <span>+28% Velocity</span>
            </div>
          </div>

          {/* Cluster Node 3 */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-yellow-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-yellow-400 font-bold text-[10px]">CLUSTER #03 • 8 OCCURRENCES</span>
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
            </div>
            <div className="font-bold text-white text-xs">
              Rotary Tongs ➔ Snap-Back Bite Zone ➔ Drill Floor Crush
            </div>
            <div className="text-[11px] text-slate-400">
              Primary Sites: <strong className="text-slate-300">Drill Floor Rig 9 (Moran Deep)</strong>
            </div>
            <div className="flex items-center gap-2 pt-1 font-mono text-[10px] text-amber-400">
              <span>LSR-05: Line of Fire</span>
              <span>•</span>
              <span>+33% Velocity</span>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Clustered List of Recurring Precursor Patterns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredPatterns.map((pat) => {
          const isUp = pat.trendDirection === 'up';

          return (
            <div
              key={pat.id}
              className="p-5 rounded-2xl bg-[#090D16] border border-slate-800/90 hover:border-amber-500/50 transition-all duration-200 shadow-xl space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Header: Frequency, Severity, Trend */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                      {pat.frequency} Occurrences This Month
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      pat.severity === 'CRITICAL' 
                        ? 'bg-red-500/15 text-red-400 border border-red-500/30' 
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}>
                      {pat.severity}
                    </span>
                  </div>

                  <div className={`flex items-center gap-1 text-xs font-mono font-bold ${
                    isUp ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{pat.trend}</span>
                  </div>
                </div>

                {/* Main Clustered Pattern Description */}
                <div>
                  <h3 className="text-base font-bold text-white font-heading group-hover:text-amber-400 transition-colors">
                    {pat.activity}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-amber-400/90 font-medium mt-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{pat.location}</span>
                  </div>
                </div>

                {/* Structured Breakdown: Barrier Failure & Energy Vector */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block">BARRIER FAILURE TYPE:</span>
                    <span className="font-bold text-red-400">{pat.barrierFailure}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block">ENERGY RELEASE VECTOR:</span>
                    <span className="text-slate-300 font-mono">{pat.energyVector}</span>
                  </div>
                </div>

                {/* Representative NLP Quote */}
                <div className="p-2.5 rounded-xl bg-[#070A12] border border-slate-800/80 text-xs text-slate-300 italic">
                  "{pat.representativePhrase}"
                </div>
              </div>

              {/* Footer: Linked Life-Saving Rule & View Reports Action */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <span className="text-amber-400 font-bold">{pat.ruleName}</span>
                  <span>•</span>
                  <span>{pat.mitigationStatus}</span>
                </div>

                <button
                  onClick={() => onViewPatternReports && onViewPatternReports(pat.ruleName)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-all cursor-pointer"
                >
                  <span>View {pat.linkedReportCount} Reports</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
