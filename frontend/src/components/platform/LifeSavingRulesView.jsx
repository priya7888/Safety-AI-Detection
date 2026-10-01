import React, { useState } from 'react';
import { 
  Zap, 
  DoorClosed, 
  ArrowUpRight, 
  Anchor, 
  Crosshair, 
  Flame, 
  Car, 
  AlertOctagon, 
  FileCheck, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  ChevronRight, 
  X, 
  ArrowRight, 
  CheckCircle2,
  FileText
} from 'lucide-react';
import { SparklineAreaChart } from '../common/Charts';
import { IOGP_LIFE_SAVING_RULES } from '../../data/platformData';

export default function LifeSavingRulesView({ onFilterReportsByRule }) {
  const [selectedRule, setSelectedRule] = useState(null);

  const iconMap = {
    Zap: Zap,
    DoorClosed: DoorClosed,
    ArrowUpRight: ArrowUpRight,
    Anchor: Anchor,
    Crosshair: Crosshair,
    Flame: Flame,
    Car: Car,
    AlertOctagon: AlertOctagon,
    FileCheck: FileCheck
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto select-none">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
              IOGP Life-Saving Rules Mapping
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Standardized 9 IOGP barrier categories automatically tagged to free-text safety reports via NLP
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-mono">9 Rules Standardized • 401 Field Reports Mapped</span>
        </div>
      </div>

      {/* 2. Grid of the 9 IOGP Life-Saving Rule Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {IOGP_LIFE_SAVING_RULES.map((rule) => {
          const Icon = iconMap[rule.iconName] || ShieldCheck;
          const isUp = rule.trendDirection === 'up';

          return (
            <div
              key={rule.id}
              onClick={() => setSelectedRule(rule)}
              className="p-5 rounded-2xl bg-[#090D16] border border-slate-800/90 hover:border-amber-500/50 hover:bg-slate-850/90 transition-all duration-200 cursor-pointer flex flex-col justify-between group shadow-xl relative overflow-hidden"
            >
              {/* Top Bar: Icon, Code & Trend */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-950 font-black shadow-md shrink-0"
                      style={{ backgroundColor: rule.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-mono font-bold text-amber-400">
                        {rule.code}
                      </span>
                      <h3 className="text-base font-bold text-white font-heading group-hover:text-amber-400 transition-colors">
                        {rule.name}
                      </h3>
                    </div>
                  </div>

                  {/* Trend Badge */}
                  <div className={`flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                    isUp 
                      ? 'bg-red-500/10 text-red-400 border border-red-500/30' 
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{rule.trend}</span>
                  </div>
                </div>

                {/* Definition */}
                <p className="text-xs text-slate-300 mt-3 line-clamp-2 leading-relaxed">
                  {rule.shortDef}
                </p>
              </div>

              {/* Bottom Metrics: Report Counts & Click To Inspect */}
              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 block text-[10px]">TOTAL</span>
                    <strong className="text-white text-sm">{rule.reportCount}</strong>
                  </div>
                  <div className="border-l border-slate-800 pl-3">
                    <span className="text-slate-500 block text-[10px]">SIF FLAGS</span>
                    <strong className="text-amber-400 text-sm">{rule.sifCount}</strong>
                  </div>
                </div>

                <div className="text-xs text-slate-400 group-hover:text-amber-400 font-bold flex items-center gap-1 transition-colors">
                  <span>Details</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. RULE DETAIL DRAWER / MODAL */}
      {selectedRule && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div className="flex-1" onClick={() => setSelectedRule(null)} />

          <div className="w-full max-w-xl bg-[#090D16] border-l border-slate-800 h-full overflow-y-auto shadow-2xl flex flex-col justify-between text-left p-6 sm:p-8 space-y-6 custom-scrollbar animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div className="space-y-3 pb-4 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-black text-amber-400 px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                    {selectedRule.code}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    IOGP Standard 9
                  </span>
                </div>

                <button
                  onClick={() => setSelectedRule(null)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h3 className="text-xl font-black text-white font-heading">
                {selectedRule.name}
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {selectedRule.shortDef}
              </p>
            </div>

            {/* Live Count & SIF Density Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 font-mono">Total Reports</div>
                <div className="text-2xl font-black text-white font-mono mt-0.5">
                  {selectedRule.reportCount}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-500/30 text-center">
                <div className="text-[10px] text-amber-400 font-mono font-semibold">SIF Potential</div>
                <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">
                  {selectedRule.sifCount}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 font-mono">SIF Ratio</div>
                <div className="text-2xl font-black text-slate-200 font-mono mt-0.5">
                  {((selectedRule.sifCount / selectedRule.reportCount) * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Historical Count Trend Chart */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Monthly Violation & Precursor Trend
                </span>
                <span className="text-amber-400 font-mono text-[11px]">
                  5-Month Log
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#070A12] border border-slate-800">
                <SparklineAreaChart 
                  data={selectedRule.historicalTrend} 
                  color={selectedRule.color} 
                  height={130} 
                />
              </div>
            </div>

            {/* Top 3 Triggering Sites */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Top 3 Facilities Triggering This Rule
              </div>
              <div className="space-y-1.5">
                {selectedRule.topSites.map((site, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-semibold text-slate-200">{site}</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-400">Rank #{idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Recurring Precursor Phrases */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Top NLP Precursor Phrases Extracted
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedRule.keyPhrases.map((phrase, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
                    "{phrase}"
                  </span>
                ))}
              </div>
            </div>

            {/* Action CTA: Filter Reports to This Rule */}
            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  const rule = selectedRule;
                  setSelectedRule(null);
                  if (onFilterReportsByRule) onFilterReportsByRule(rule.name);
                }}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer font-heading"
              >
                <span>Filter Triage Queue to {selectedRule.name} ({selectedRule.reportCount} reports)</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
