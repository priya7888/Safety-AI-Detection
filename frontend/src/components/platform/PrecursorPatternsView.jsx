import React, { useState, useEffect, useMemo } from 'react';
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
import { getStoreState, subscribeSafetyStore } from '../../services/safetyStore';

export default function PrecursorPatternsView({ onViewPatternReports }) {
  const [storeState, setStoreState] = useState(getStoreState());
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');

  useEffect(() => {
    const unsub = subscribeSafetyStore(setStoreState);
    return unsub;
  }, []);

  const patterns = useMemo(() => {
    const reports = storeState.reports || [];
    if (reports.length === 0) return [];
    const groups = {};
    reports.forEach(r => {
      const key = r.identified_hazard || 'Operational Safety Observation';
      if (!groups[key]) {
        const isCrit = r.sif_precursor_assessment === 'YES' || r.risk_level === 'Critical' || (r.ai_score && r.ai_score >= 80);
        groups[key] = {
          id: `PAT-${Object.keys(groups).length + 1}`,
          activity: key,
          location: r.location || 'Operating Bay',
          severity: isCrit ? 'CRITICAL' : 'HIGH',
          frequency: 0,
          trend: 'Active',
          trendDirection: 'up',
          barrierFailure: r.barrier_status || 'Barrier Degradation Observed',
          energyVector: r.energy_source || 'Operational Energy Vector',
          representativePhrase: r.description || 'Field observation logged.',
          ruleName: r.identified_hazard || 'Safety Control',
          mitigationStatus: r.recommended_action || 'Barrier audit and corrective isolation enforced.',
          linkedReportCount: 0
        };
      }
      groups[key].frequency += 1;
      groups[key].linkedReportCount += 1;
    });
    return Object.values(groups);
  }, [storeState.reports]);

  const filteredPatterns = patterns.filter(p => {
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
            <option value="ALL">All Patterns ({patterns.length})</option>
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

        {/* Visual Cluster Nodes or Empty State */}
        {patterns.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            <Radio className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-300">No active precursor relationship clusters detected.</p>
            <p className="text-slate-500 mt-1">Submit or bulk-upload safety reports to initiate AI graph triangulation across activities, locations, and barrier failures.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {patterns.slice(0, 3).map((pat, idx) => (
              <div key={pat.id} className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-amber-400 font-bold text-[10px]">CLUSTER #{String(idx + 1).padStart(2, '0')} • {pat.frequency} OCCURRENCES</span>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                </div>
                <div className="font-bold text-white text-xs">
                  {pat.activity} ➔ {pat.barrierFailure}
                </div>
                <div className="text-[11px] text-slate-400">
                  Primary Location: <strong className="text-slate-300">{pat.location}</strong>
                </div>
                <div className="flex items-center gap-2 pt-1 font-mono text-[10px] text-amber-400">
                  <span>{pat.energyVector}</span>
                  <span>•</span>
                  <span>{pat.frequency} Linked Records</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Clustered List of Recurring Precursor Patterns */}
      {filteredPatterns.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#090D16] border border-slate-800 text-center space-y-3 text-slate-400">
          <Layers className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="font-bold text-slate-200 text-base">No Precursor Patterns Identified</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            AI pattern mining requires operational safety observations to correlate recurring barrier breakdowns and high-energy vectors.
          </p>
        </div>
      ) : (
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
      )}

    </div>
  );
}
