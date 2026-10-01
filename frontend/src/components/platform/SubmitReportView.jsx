import React, { useState } from 'react';
import { 
  FileSearch, 
  Info, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  ShieldAlert,
  Zap,
  ArrowRight,
  Layers,
  Activity,
  Cpu
} from 'lucide-react';
import { api } from '../../services/api';

export default function SubmitReportView({ onReportCreated }) {
  const [reportType, setReportType] = useState('UNSAFE_CONDITION');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [additionalContext, setAdditionalContext] = useState('');
  
  const [validationError, setValidationError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStepIndex, setAnalysisStepIndex] = useState(0);

  const pipelineStages = [
    { title: "1. Text Ingestion & Lexical Cleaning", desc: "Tokenization, negation preservation, and safety domain entity isolation." },
    { title: "2. Hazard & Energy Vector Extraction", desc: "Identifying primary energy sources: Gravity, Kinetic, Electrical, or Pressurized fluids." },
    { title: "3. Barrier Failure Diagnostics", desc: "Evaluating Engineering, Administrative, and PPE defense status (Failed/Missing/Present)." },
    { title: "4. Life-Saving Rule (LSR) Protocol Match", desc: "Mapping against standard IOGP 9 Life-Saving Rules and mandatory controls." },
    { title: "5. SIF Precursor Determination", desc: "Synthesizing exposure severity and barrier collapse probability into SIF verdict." },
    { title: "6. Explainable AI Causal Synthesis", desc: "Building deterministic audit trail and why the AI identified this precursor." }
  ];

  const sampleScenarios = [
    {
      title: "Work at Height (Unclipped at 8m)",
      type: "UNSAFE_ACT",
      location: "Pipe Rack Scaffolding Bay 4",
      desc: "Contractor observed working on scaffolding platform at 8 meters elevation without clipping twin lanyards to the static lifeline. Scaffolding mid-rail was temporarily unbolted for material passage.",
      context: "Wind speed 18 knots, shift changeover underway."
    },
    {
      title: "Bypassed Safety Interlock",
      type: "UNSAFE_CONDITION",
      location: "CPF Compressor Station Train 2",
      desc: "High-pressure emergency shutdown (ESD) interlock switch on discharge scrubber was bridged with copper jumper wire without Management of Change (MOC) or bypass permit.",
      context: "Pressure operating at 48 barg with hydrocarbon condensate."
    },
    {
      title: "Suspended Load Near-Miss",
      type: "NEAR_MISS",
      location: "Bay 2 Heavy Fabrication Shop",
      desc: "Worker operating overhead bridge crane in Bay 2 with worn wire rope. A 2-ton steel beam slipped during transport and swung into designated pedestrian walkway where two workers were walking. No exclusion zone was present.",
      context: "Hoist limit switch functional but sling frayed."
    }
  ];

  const handleApplyScenario = (scenario) => {
    setReportType(scenario.type);
    setLocation(scenario.location);
    setDescription(scenario.desc);
    setAdditionalContext(scenario.context);
    setValidationError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!description.trim() || description.trim().length < 10) {
      setValidationError('Please provide a descriptive report of at least 10 characters so the AI can extract hazards and barrier states.');
      return;
    }
    if (!location.trim() || location.trim().length < 2) {
      setValidationError('Please specify the operational location or plant unit.');
      return;
    }
    if (!reportDate) {
      setValidationError('Please specify the observation date.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStepIndex(0);

    const stepInterval = setInterval(() => {
      setAnalysisStepIndex((prev) => (prev < pipelineStages.length - 1 ? prev + 1 : prev));
    }, 500);

    try {
      const createdReport = await api.submitReport({
        report_type: reportType,
        description: description.trim(),
        location: location.trim(),
        report_date: reportDate,
        additional_context: additionalContext.trim() || null
      });

      clearInterval(stepInterval);
      setTimeout(() => {
        setIsAnalyzing(false);
        if (onReportCreated) {
          onReportCreated(createdReport.id);
        }
      }, 600);

    } catch (err) {
      clearInterval(stepInterval);
      setIsAnalyzing(false);
      setValidationError(err.message || 'Safety report analysis could not be completed. Please check backend connection.');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 select-none">
      
      {/* Intro Header */}
      <div className="bg-[#090D16] p-6 rounded-2xl border border-slate-800/90 shadow-xl space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <FileSearch className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-heading">
              Ingest & Analyze Free-Text Safety Report
            </h2>
            <p className="text-xs text-slate-400">
              Submit free-text field observations. SafetyAI executes multi-stage NLP hazard extraction, energy vector analysis, and IOGP Life-Saving Rule mapping.
            </p>
          </div>
        </div>
      </div>

      {/* Validation Banner */}
      {validationError && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Interactive Pre-Populate Benchmark Scenarios */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>QUICK BENCHMARK SCENARIOS</span>
          <span className="text-amber-400 text-[11px]">Click to auto-fill</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {sampleScenarios.map((sc, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleApplyScenario(sc)}
              className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-amber-500/40 text-left transition-all group cursor-pointer"
            >
              <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors flex items-center justify-between">
                <span>{sc.title}</span>
                <Sparkles className="w-3 h-3 text-amber-400 opacity-60 group-hover:opacity-100" />
              </div>
              <div className="text-[10px] text-slate-400 mt-1 truncate">
                {sc.location}
              </div>
              <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                {sc.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="bg-[#090D16] p-6 rounded-2xl border border-slate-800/90 shadow-xl space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Report Type */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Report Category
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#070A12] text-xs text-white rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="NEAR_MISS">Near-Miss Report</option>
              <option value="UNSAFE_ACT">Unsafe Act (UA)</option>
              <option value="UNSAFE_CONDITION">Unsafe Condition (UC)</option>
              <option value="INCIDENT">Incident / Mishap</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Facility / Operational Site
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Drill Floor Rig 9, Bay 2 Heavy Fab..."
              className="w-full px-3.5 py-2.5 bg-[#070A12] text-xs text-white placeholder-slate-500 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400"
            />
          </div>

        </div>

        {/* Free-Text Observation */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Free-Text Safety Observation / Narrative
            </label>
            <span className="text-[10px] text-slate-500 font-mono">Minimum 10 chars</span>
          </div>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what occurred, equipment involved, worker actions, and barrier conditions..."
            className="w-full p-3.5 bg-[#070A12] text-xs text-white placeholder-slate-500 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 leading-relaxed font-sans"
          />
        </div>

        {/* Date & Additional Context */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Event Date
            </label>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#070A12] text-xs text-white rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Additional Context (Optional)
            </label>
            <input
              type="text"
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="Weather, shift change, equipment serial..."
              className="w-full px-3.5 py-2 bg-[#070A12] text-xs text-white placeholder-slate-500 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Submit CTA */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={isAnalyzing}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2 font-heading tracking-wide"
          >
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
            <span>{isAnalyzing ? 'Executing AI Pipeline...' : 'Analyze Report with SafetyAI'}</span>
          </button>
        </div>
      </form>

      {/* Multi-Stage AI Pipeline Processing Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#090D16] border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 text-left">
            
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 animate-spin">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-heading">
                  SafetyAI Precursor Extraction Engine
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Natural Language Processing & Barrier Verification
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {pipelineStages.map((stg, idx) => {
                const isCurrent = idx === analysisStepIndex;
                const isPast = idx < analysisStepIndex;

                return (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {isPast ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isCurrent ? (
                        <span className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin block" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-slate-700 block" />
                      )}
                    </div>
                    <div>
                      <div className={`text-xs font-bold ${isCurrent ? 'text-amber-400' : isPast ? 'text-slate-200' : 'text-slate-500'}`}>
                        {stg.title}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {stg.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-mono text-center">
              Target: Oil India Limited HSSE Repository (PS 26165)
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
