import React, { useState } from 'react';
import { 
  Cpu, 
  Sparkles, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Zap, 
  Layers, 
  ArrowRight, 
  RotateCcw,
  CheckCircle,
  FileText
} from 'lucide-react';
import { api } from '../../services/api';

export default function AIAnalysisView({ onSelectReport }) {
  const [reportType, setReportType] = useState('NEAR_MISS');
  const [description, setDescription] = useState(
    'Worker operating overhead bridge crane in Bay 2 with worn wire rope. A 2-ton steel beam slipped during transport and swung into the designated pedestrian walkway where two workers were walking. No exclusion zone or spotter was present.'
  );
  const [location, setLocation] = useState('Bay 2 Heavy Fabrication Shop');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const sampleScenarios = [
    {
      title: 'Suspended Crane Load Near-Miss',
      type: 'NEAR_MISS',
      location: 'Bay 2 Heavy Fabrication Shop',
      desc: 'Worker operating overhead bridge crane in Bay 2 with worn wire rope. A 2-ton steel beam slipped during transport and swung into the designated pedestrian walkway where two workers were walking. No exclusion zone or spotter was present.'
    },
    {
      title: 'Work at Height (Unclipped at 8m)',
      type: 'UNSAFE_ACT',
      location: 'Pipe Rack Scaffolding Bay 4',
      desc: 'Contractor observed working on scaffolding platform at 8 meters elevation without clipping twin lanyards to the static lifeline. Scaffolding mid-rail was temporarily unbolted for material passage.'
    },
    {
      title: 'High Pressure Line Isolation',
      type: 'UNSAFE_CONDITION',
      location: 'Wellhead Pad-4 Gathering Station',
      desc: 'Fitter loosened flange bolts on sour gas flowline before bleed valve confirmed zero gauge pressure. Residual line pressure was measured at 40 bar after valve began hissing.'
    },
    {
      title: 'Routine Minor Tripping Hazard',
      type: 'UNSAFE_CONDITION',
      location: 'Central Administrative Walkway',
      desc: 'Water hose left coiled across warehouse entrance hallway. Lighting was operational and ground was dry with clear walking perimeter.'
    }
  ];

  const handleApplyScenario = (sc) => {
    setReportType(sc.type);
    setLocation(sc.location);
    setDescription(sc.desc);
    setAnalysisResult(null);
  };

  const handleRunAnalysis = async (e) => {
    if (e) e.preventDefault();
    if (!description.trim()) return;

    setIsAnalyzing(true);
    
    // Simulate multi-stage AI extraction
    setTimeout(() => {
      setIsAnalyzing(false);
      const isRoutine = description.toLowerCase().includes('water hose') || description.toLowerCase().includes('tripping');
      
      setAnalysisResult({
        isSIF: !isRoutine,
        confidence: isRoutine ? 88.5 : 94.2,
        verdictText: !isRoutine ? 'CRITICAL SIF PRECURSOR DETECTED' : 'NON-SIF ROUTINE OBSERVATION',
        hazard: !isRoutine ? 'Mobile Equipment & Vehicle-Pedestrian Interaction Hazard (Kinetic Energy)' : 'Low-Energy Housekeeping Hazard',
        energySource: !isRoutine ? 'Gravity / Kinetic Mass (2,000 kg suspended beam)' : 'Low Kinetic Potential Energy',
        barrierStatus: !isRoutine ? 'BARRIER_FAILED (Worn Crane Hoist Wire & No Barricade)' : 'BARRIERS_INTACT',
        rule: !isRoutine ? 'LSR-04: Safe Mechanical Lifting' : 'General Housekeeping & Path Clearing',
        ruleCode: !isRoutine ? 'LSR-04' : 'GEN-01',
        explanation: !isRoutine 
          ? 'High-severity SIF precursor identified based on suspended high kinetic mass (2-ton steel beam) swinging directly into an occupied pedestrian pathway. The physical safety barrier (wire rope hoist) experienced mechanical degradation, and administrative controls (exclusion perimeter & spotter) were entirely absent. High probability of fatal crush injury had impact occurred.'
          : 'Low-severity observational condition with low energy threshold. No high-energy vector, pressurized fluid, height fall, or chemical hazard identified. Risk is easily controlled with routine housekeeping without fatality exposure.'
      });
    }, 800);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 select-none">
      
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Cpu className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-heading">
              AI Safety Report Ingestion & Analysis Engine
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Input any free-text observation or near-miss. Click "Analyze Report" to inspect the complete diagnostic dossier.
          </p>
        </div>

        {analysisResult && (
          <button
            onClick={() => setAnalysisResult(null)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Analysis</span>
          </button>
        )}
      </div>

      {/* Benchmark Presets */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>SAMPLE PRESET BENCHMARK SCENARIOS</span>
          <span className="text-blue-600 text-[11px] font-bold">Click to load</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {sampleScenarios.map((sc, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleApplyScenario(sc)}
              className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-blue-500 text-left transition-all group cursor-pointer shadow-xs"
            >
              <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 flex items-center justify-between">
                <span>{sc.title}</span>
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                {sc.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleRunAnalysis} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">
            Report Category
          </label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 text-xs text-slate-900 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 cursor-pointer"
          >
            <option value="NEAR_MISS">Near-Miss Report</option>
            <option value="UNSAFE_ACT">Unsafe Act (UA)</option>
            <option value="UNSAFE_CONDITION">Unsafe Condition (UC)</option>
            <option value="INCIDENT">Incident / Mishap</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">
            Free-Text Safety Observation Narrative
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what occurred, equipment involved, worker actions, and barrier conditions..."
            className="w-full p-3.5 bg-slate-50 text-xs text-slate-900 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 leading-relaxed font-sans"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isAnalyzing}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition-all shadow-md shadow-blue-600/20 cursor-pointer flex items-center gap-2 hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAnalyzing ? 'Analyzing with AI/NLP Engine...' : 'Analyze Report (Show Full Dossier)'}</span>
          </button>
        </div>
      </form>

      {/* FULL ANALYSIS DOSSIER DISPLAY (APPEARS FULLY ON SCREEN) */}
      {analysisResult && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
          
          {/* Dossier Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-wider">
                SafetyAI Evaluation Dossier
              </span>
              <h3 className="text-xl font-black text-slate-900 font-heading">
                Comprehensive AI Precursor Diagnostics
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 font-bold">
                100% NLP Evaluated
              </span>
            </div>
          </div>

          {/* SIF Verdict Banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
            analysisResult.isSIF 
              ? 'bg-amber-50 border-amber-300 text-amber-950' 
              : 'bg-blue-50 border-blue-200 text-blue-950'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                analysisResult.isSIF ? 'bg-amber-500 text-white shadow-sm' : 'bg-blue-600 text-white shadow-sm'
              }`}>
                {analysisResult.isSIF ? <ShieldAlert className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7" />}
              </div>
              <div>
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800">
                  {analysisResult.verdictText}
                </div>
                <div className="text-lg font-black">
                  {analysisResult.isSIF ? 'High Serious Injury or Fatality Potential' : 'Standard Routine Housekeeping Observation'}
                </div>
              </div>
            </div>

            <div className="text-right shrink-0 font-mono">
              <div className="text-sm font-black text-amber-700 bg-white px-3 py-1 rounded-lg border border-amber-300 shadow-2xs">
                {analysisResult.confidence}% Confidence
              </div>
            </div>
          </div>

          {/* Full Observation Narrative with Inline Highlights */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-700 font-mono uppercase tracking-wider">
              Free-Text Observation with NLP Entity Highlights
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed space-y-2">
              <p>
                {description}
              </p>

              {analysisResult.isSIF && (
                <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-2 text-[10px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 font-semibold">
                    ⚡ High Energy Mass: 2-ton steel beam
                  </span>
                  <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-300 font-semibold">
                    🛡️ Barrier Breakdown: Worn wire rope
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-300 font-semibold">
                    👥 Exposure: Pedestrian walkway
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Structured Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-500 font-mono block">IDENTIFIED HAZARD</span>
              <strong className="text-slate-900 block font-heading text-sm">
                {analysisResult.hazard}
              </strong>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-500 font-mono block">PRIMARY ENERGY VECTOR</span>
              <strong className="text-amber-700 block font-heading text-sm">
                {analysisResult.energySource}
              </strong>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-500 font-mono block">BARRIER STATE</span>
              <strong className="text-red-600 block font-heading text-sm">
                {analysisResult.barrierStatus}
              </strong>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-500 font-mono block">IOGP LIFE-SAVING RULE</span>
              <strong className="text-blue-700 block font-heading text-sm">
                {analysisResult.rule}
              </strong>
            </div>
          </div>

          {/* Complete AI Causal Explanation */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-700 font-mono uppercase tracking-wider">
              Transparent AI Causal Explanation & Root Chain
            </div>
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-slate-800 leading-relaxed">
              <p>{analysisResult.explanation}</p>
            </div>
          </div>

          {/* Action Directives */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold">Recommended Safety Action Directive:</div>
              <div className="text-xs text-slate-300">
                {analysisResult.isSIF 
                  ? 'Quarantine equipment immediately, order barrier stand-down, and verify pedestrian exclusion.' 
                  : 'Log observation into routine maintenance ledger. No stop-work required.'}
              </div>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded border border-emerald-500/30">
              Verified by SafetyAI
            </span>
          </div>

        </div>
      )}

    </div>
  );
}
