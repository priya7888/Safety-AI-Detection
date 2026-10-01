import React, { useState } from 'react';
import { 
  TrendingUp, 
  ShieldAlert, 
  ShieldCheck, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  Info,
  BarChart2,
  FileText,
  Activity,
  Sliders
} from 'lucide-react';
import { VerticalBarChart } from '../common/Charts';
import { 
  NLP_EXPLAINABILITY_SAMPLE, 
  SIF_TREND_DATA 
} from '../../data/platformData';

export default function SIFIntelligenceView({ onSelectReport }) {
  const [selectedSample, setSelectedSample] = useState(NLP_EXPLAINABILITY_SAMPLE);

  const deptData = [
    { department: 'Drilling Operations', total: 129, sif: 36, rate: 27.9 },
    { department: 'Mechanical Fab & Rigging', total: 98, sif: 26, rate: 26.5 },
    { department: 'Wellhead & Production', total: 74, sif: 16, rate: 21.6 },
    { department: 'Gas Processing & Plant', total: 60, sif: 12, rate: 20.0 },
    { department: 'Pipeline Logistics', total: 40, sif: 6, rate: 15.0 },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto select-none">
      
      {/* 1. Header & SIH 20-25% Benchmark Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0C1524] via-[#101C33] to-[#0A101C] border border-amber-500/25 p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-mono text-xs font-bold border border-amber-500/30 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                SIH PS 26165 CORE INTELLIGENCE
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Oil India Limited Benchmark
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
              SIF Precursor Analytics & The 20–25% Fatality Benchmark
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Industrial safety science establishes that minor workplace injuries and fatal events stem from different root cause mechanisms. While low-severity incidents decline rapidly through general housekeeping, fatalities persist unless the <strong className="text-amber-400 font-bold"> genuine 20–25% SIF precursors </strong> are isolated and eliminated before energy release occurs.
            </p>
          </div>

          {/* Benchmark Gauge Widget */}
          <div className="p-4 rounded-2xl bg-[#070A12] border border-amber-500/30 text-center min-w-[220px] shrink-0 shadow-lg">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              Observed SIF Precursor Rate
            </div>
            <div className="text-3xl font-black text-amber-400 font-mono mt-1">
              23.8%
            </div>
            <div className="mt-1 text-[11px] text-emerald-400 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Calibrated to 20-25% Target</span>
            </div>
            <div className="mt-2 w-full bg-slate-800 h-2 rounded-full overflow-hidden relative">
              <div className="absolute left-[20%] right-[75%] top-0 bottom-0 bg-amber-500/30" title="20-25% Target Band" />
              <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full" style={{ width: '23.8%' }} />
            </div>
            <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
              <span>0%</span>
              <span className="text-amber-400 font-bold">20% - 25% Benchmark</span>
              <span>50%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Statistical Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="p-4 rounded-2xl bg-[#090D16] border border-slate-800 shadow-lg space-y-1">
          <div className="text-slate-400 text-xs">Total Ingested Observations</div>
          <div className="text-2xl font-black text-white font-mono">401 Reports</div>
          <div className="text-[11px] text-slate-400 font-mono">100% Free-Text Processed</div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-2xl bg-[#090D16] border border-amber-500/30 shadow-lg space-y-1">
          <div className="text-amber-400 text-xs font-semibold">Identified SIF Precursors</div>
          <div className="text-2xl font-black text-amber-400 font-mono">96 Flags</div>
          <div className="text-[11px] text-emerald-400 font-medium">+14 High Energy Interventions</div>
        </div>

        {/* Metric 3: Human-in-the-Loop Override Rate */}
        <div className="p-4 rounded-2xl bg-[#090D16] border border-slate-800 shadow-lg space-y-1">
          <div className="text-slate-400 text-xs">Human Reviewer Override Rate</div>
          <div className="text-2xl font-black text-white font-mono">1.8%</div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>High Trust (98.2% AI Agreement)</span>
          </div>
        </div>

        {/* Metric 4: Average Confidence */}
        <div className="p-4 rounded-2xl bg-[#090D16] border border-slate-800 shadow-lg space-y-1">
          <div className="text-slate-400 text-xs">Mean NLP Classification Confidence</div>
          <div className="text-2xl font-black text-white font-mono">93.4%</div>
          <div className="text-[11px] text-slate-400 font-mono">Dual Encoder + Transformer</div>
        </div>

      </div>

      {/* 3. Deep Analytics: Departmental Breakdown & Model Confidence Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Department SIF Rate Breakdown (7 cols) */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-2xl bg-[#090D16] border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-amber-400" />
                <span>SIF-Potential Rate by Operational Department</span>
              </h3>
              <p className="text-xs text-slate-400">
                Comparing total observations vs SIF-potential precursors across departments
              </p>
            </div>
            <span className="text-xs font-mono text-amber-400 font-bold">20-25% Target Band</span>
          </div>

          <div className="space-y-3 pt-2">
            {deptData.map((d, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">{d.department}</span>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-slate-400">{d.sif} SIF / {d.total} total</span>
                    <span className={`font-black ${d.rate > 25 ? 'text-red-400' : 'text-amber-400'}`}>
                      {d.rate.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden relative">
                  <div 
                    className={`h-full rounded-full ${
                      d.rate > 25 ? 'bg-gradient-to-r from-red-500 to-amber-500' : 'bg-gradient-to-r from-amber-500 to-yellow-500'
                    }`} 
                    style={{ width: `${d.rate * 2.5}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400">
            Drilling Operations and Heavy Fabrication exceed the 25% upper threshold, indicating heightened exposure to high kinetic energy and drops.
          </div>
        </div>

        {/* Model Confidence Distribution (5 cols) */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-[#090D16] border border-slate-800/90 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-400" />
              <span>Model Confidence Distribution</span>
            </h3>
            <p className="text-xs text-slate-400">
              Distribution of NLP classification confidence across all reports
            </p>

            <div className="pt-2">
              <VerticalBarChart data={selectedSample.modelConfidenceDistribution} height={170} />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>82% of evaluations fall in the &gt;80% high certainty band.</span>
            <span className="text-emerald-400 font-mono font-bold">Low Ambiguity</span>
          </div>
        </div>

      </div>

      {/* 4. "Why Flagged" NLP Explainability Panel */}
      <div className="p-6 rounded-2xl bg-[#090D16] border border-slate-800/90 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white font-heading">
                "Why Flagged" — NLP Explainability & Factor Attribution
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Transparent, SHAP-style keyword weighting revealing why report {selectedSample.reportId} was classified as SIF-Potential
            </p>
          </div>

          <button
            onClick={() => onSelectReport(8)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Inspect in Triage Drawer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Sample Report & Inline Highlight (6 cols) */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 font-mono uppercase tracking-wider">
                Sample Evaluated Free-Text Observation
              </span>
              <span className="text-amber-400 font-mono text-[11px] font-bold">
                {selectedSample.confidenceScore}% SIF Confidence
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#070A12] border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-3">
              <p>
                {selectedSample.textWithHighlights.map((item, idx) => {
                  if (!item.highlight) return <span key={idx}>{item.text}</span>;
                  return (
                    <span 
                      key={idx}
                      className={`px-1.5 py-0.5 rounded font-bold border ${
                        item.highlight === 'high-energy'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : item.highlight === 'barrier-failure'
                          ? 'bg-red-500/20 text-red-300 border-red-500/40'
                          : item.highlight === 'exposure'
                          ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                          : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      }`}
                      title={item.label}
                    >
                      {item.text}
                    </span>
                  );
                })}
              </p>

              <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div>
                  <span className="text-slate-500">IOGP Rule:</span>{' '}
                  <span className="text-amber-400 font-bold">{selectedSample.iogpRule}</span>
                </div>
                <div>
                  <span className="text-slate-500">Energy Vector:</span>{' '}
                  <span className="text-white font-bold">{selectedSample.energySource}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Weights Attribution (6 cols) */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 font-mono uppercase tracking-wider">
                Top NLP Weighted Phrases (SHAP Values)
              </span>
              <span className="text-slate-500 text-[11px] font-mono">Positive = Pushes toward SIF</span>
            </div>

            <div className="space-y-2">
              {selectedSample.featureWeights.map((f, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full ${f.weight > 0 ? 'bg-amber-400' : 'bg-slate-500'}`} />
                      <span className="font-mono text-slate-200 truncate">{f.feature}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono shrink-0">
                      <span className="text-[10px] text-slate-500">{f.type}</span>
                      <span className={`font-bold ${f.weight > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                        {f.weight > 0 ? `+${f.weight.toFixed(2)}` : f.weight.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${f.weight > 0 ? 'bg-amber-400' : 'bg-slate-500'}`} 
                      style={{ width: `${Math.abs(f.weight) * 200}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
