import React, { useState } from 'react';
import { 
  ShieldAlert, 
  BrainCircuit, 
  Activity, 
  Sliders, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronDown, 
  ChevronUp, 
  Eye, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import PageHeader from '../common/PageHeader';
import { MOCK_RECURRING_SIF_PATTERNS, MOCK_REPORTS } from '../data/mockData';

export default function SifIntelligencePage({ onSelectReport, onOpenLogSif }) {
  const [selectedPattern, setSelectedPattern] = useState(MOCK_RECURRING_SIF_PATTERNS[0]);
  const [evidencePanelOpen, setEvidencePanelOpen] = useState(true);

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      
      {/* Page Header */}
      <PageHeader
        title="SIF Intelligence"
        subtitle="Identify serious injury and fatality potential, precursors, and control failures."
        badge="Pattern Recognition Active"
        onUploadClick={onOpenLogSif}
        uploadLabel="+ Log SIF Observation"
      />

      {/* Top 4 Metrics Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0f141e] border border-red-500/20 shadow-lg">
          <span className="text-xs text-red-400 font-medium">SIF Potential</span>
          <div className="text-3xl font-bold text-white mt-1.5 font-sans">87</div>
          <span className="text-[11px] text-red-400 font-mono mt-1 block">High-Energy Precursors</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f141e] border border-white/[0.08] shadow-lg">
          <span className="text-xs text-amber-400 font-medium">Model Confidence</span>
          <div className="text-3xl font-bold text-amber-400 mt-1.5 font-sans">92.4%</div>
          <span className="text-[11px] text-slate-400 font-mono mt-1 block">IOGP Framework Calibrated</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f141e] border border-white/[0.08] shadow-lg">
          <span className="text-xs text-emerald-400 font-medium">Active Precursors</span>
          <div className="text-3xl font-bold text-white mt-1.5 font-sans">143</div>
          <span className="text-[11px] text-slate-400 font-mono mt-1 block">Across All Assets</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f141e] border border-white/[0.08] shadow-lg">
          <span className="text-xs text-amber-400 font-medium">Control Failures</span>
          <div className="text-3xl font-bold text-white mt-1.5 font-sans">31</div>
          <span className="text-[11px] text-red-400 font-mono mt-1 block">Barrier Gaps Identified</span>
        </div>
      </div>

      {/* PRIMARY SECTION: RECURRING SIF PATTERNS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-wide font-heading uppercase">
              RECURRING SIF PATTERNS
            </h2>
            <p className="text-xs text-slate-400">
              Correlated precursor clusters identified across multiple field reports
            </p>
          </div>
          <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
            {MOCK_RECURRING_SIF_PATTERNS.length} Active Systemic Patterns
          </span>
        </div>

        {/* Pattern Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_RECURRING_SIF_PATTERNS.map((pattern) => {
            const isSelected = selectedPattern?.id === pattern.id;
            const isHigh = pattern.priority === 'HIGH';

            return (
              <div
                key={pattern.id}
                onClick={() => {
                  setSelectedPattern(pattern);
                  setEvidencePanelOpen(true);
                }}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3.5 ${
                  isSelected
                    ? 'bg-[#141b29] border-amber-500/60 shadow-xl shadow-amber-950/20 ring-1 ring-amber-500/30'
                    : 'bg-[#0f141e] border-white/[0.08] hover:border-white/20'
                }`}
              >
                <div>
                  {/* Top line: Priority & Trend */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      isHigh
                        ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}>
                      {pattern.priority} PRIORITY
                    </span>

                    <div className="flex items-center gap-1 text-xs font-mono font-bold text-red-400">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>{pattern.trend}</span>
                    </div>
                  </div>

                  {/* Pattern Title */}
                  <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                    {pattern.title}
                  </h3>

                  {/* Scope info */}
                  <p className="text-xs font-mono text-amber-400/90 mt-1 font-semibold">
                    {pattern.reportsCount} reports · {pattern.affectedAssets}
                  </p>
                </div>

                {/* Consequence & Critical Control */}
                <div className="pt-3 border-t border-white/[0.04] space-y-1.5 text-xs text-slate-300">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Potential Consequence:</span>
                    <span className="font-semibold text-white">{pattern.potentialConsequence}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Critical Control:</span>
                    <span className="text-amber-300 font-medium">{pattern.criticalControl}</span>
                  </div>
                </div>

                {/* Card Action */}
                <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Pattern ID: {pattern.id}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPattern(pattern);
                      setEvidencePanelOpen(true);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    <span>View Evidence</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 5: AI EVIDENCE & EXPLAINABILITY (COMPACT EXPANDABLE PANEL) */}
      {selectedPattern && (
        <div className="rounded-2xl bg-[#0f141e] border border-amber-500/30 shadow-xl overflow-hidden animate-in fade-in duration-200">
          
          <button
            onClick={() => setEvidencePanelOpen(!evidencePanelOpen)}
            className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors cursor-pointer border-b border-white/[0.06] bg-[#121826]"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white font-heading">
                    AI Evidence & Explainability
                  </h3>
                  <span className="text-xs font-mono text-amber-400 font-semibold">• {selectedPattern.title}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Pattern detection methodology and underlying signal correlation
                </p>
              </div>
            </div>

            {evidencePanelOpen ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {evidencePanelOpen && (
            <div className="p-5 sm:p-6 space-y-4 text-xs text-slate-300">
              
              {/* Detection Methodology */}
              <div className="p-4 rounded-xl bg-[#121826] border border-white/[0.06] space-y-2">
                <span className="text-[10px] uppercase font-mono font-bold text-amber-400 block">
                  Detection Methodology
                </span>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {selectedPattern.evidenceSummary}
                </p>
              </div>

              {/* AI Reasoning Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-[#121826] border border-white/[0.06] space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Energy Magnitude:</span>
                  <p className="font-semibold text-white">{selectedPattern.aiReasoning.energyMagnitude}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#121826] border border-white/[0.06] space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Barrier Degradation:</span>
                  <p className="font-semibold text-red-400">{selectedPattern.aiReasoning.barrierDegradation}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#121826] border border-white/[0.06] space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Worker Exposure:</span>
                  <p className="font-semibold text-amber-300">{selectedPattern.aiReasoning.workerExposure}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#121826] border border-red-500/20 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Result:</span>
                  <p className="font-mono font-bold text-red-400 text-sm">{selectedPattern.aiReasoning.sifPotential} SIF POTENTIAL</p>
                </div>
              </div>

              {/* Human Validation Note */}
              <div className="p-3 rounded-xl bg-[#141b28] border border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>AI assists safety professionals and does not replace certified HSSE experts.</span>
                </div>

                <button
                  onClick={() => onSelectReport(MOCK_REPORTS[0])}
                  className="text-amber-400 hover:text-amber-300 font-semibold font-mono underline cursor-pointer shrink-0 ml-2"
                >
                  Inspect Sample Report →
                </button>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
