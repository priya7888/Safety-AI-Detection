import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Cpu, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  ArrowRight,
  RefreshCw,
  Layers,
  Search
} from 'lucide-react';

export default function InteractiveAiDemoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const sampleReports = [
    {
      id: 1,
      title: 'Drilling Rig Mud Manifold (High Pressure)',
      text: 'During tripping operation at Rig-18, assistant driller observed a high-pressure flexible mud hose (rated 5000 PSI) connected to standpipe manifold with corroded safety clamp and secondary whip-check safety cable missing while pumps were operating at 3400 PSI.',
      result: {
        isSIF: true,
        sifScore: 98,
        sifCategory: 'High Potential SIF (pSIF)',
        iogpRule: 'Line of Fire (LSR-04) & Energy Isolation (LSR-01)',
        highEnergySource: 'High Hydraulic Pressure (3400 PSI)',
        barrierStatus: 'Critical Engineered Barrier Missing (Whip-check cable)',
        recommendation: 'Immediate shut down of mud pumps. Install certified secondary retention cable and replace corroded clamp before resuming tripping.'
      }
    },
    {
      id: 2,
      title: 'Scaffolding at GGS Flare Stack (Height Hazard)',
      text: 'Contractor painter working on scaffolding platform at 14-meter elevation on GGS-4 flare stack was noticed without 100% harness hook-up; scaffolding red tag was overdue for weekly structural inspection.',
      result: {
        isSIF: true,
        sifScore: 95,
        sifCategory: 'High Potential SIF (pSIF)',
        iogpRule: 'Working at Height (LSR-05) & Bypassing Safety Controls',
        highEnergySource: 'Gravitational Fall Potential (>1.8m Elevation: 14m)',
        barrierStatus: 'Compromised Fall Arrest + Expired Scaffolding Permit Tag',
        recommendation: 'Issue immediate Stop Work Authority (SWA). Suspend flare stack painting until scaffolding recertification and mandatory 100% tie-off briefing.'
      }
    },
    {
      id: 3,
      title: 'Office Admin Walkway (Low Severity)',
      text: 'Minor water dripping from canteen air conditioning unit creating small wet patch on concrete walkway outside administration building.',
      result: {
        isSIF: false,
        sifScore: 8,
        sifCategory: 'Non-SIF (Minor Housekeeping)',
        iogpRule: 'None (Housekeeping & Facility Maintenance)',
        highEnergySource: 'None (Low kinetic energy / surface friction)',
        barrierStatus: 'Non-critical facility maintenance backlog',
        recommendation: 'Assign facility maintenance technician to service AC condensation drain. Place caution wet floor cone.'
      }
    }
  ];

  const [inputReport, setInputReport] = useState(sampleReports[0].text);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(sampleReports[0].result);

  const runAnalysis = () => {
    setAnalyzing(true);
    setAnalysisResult(null);

    setTimeout(() => {
      const lower = inputReport.toLowerCase();
      const hasHighEnergy = 
        lower.includes('psi') || 
        lower.includes('pressure') || 
        lower.includes('height') || 
        lower.includes('elevation') || 
        lower.includes('scaffold') || 
        lower.includes('gas') || 
        lower.includes('h2s') || 
        lower.includes('voltage') || 
        lower.includes('whip') || 
        lower.includes('hose') || 
        lower.includes('hot work') || 
        lower.includes('confined') || 
        lower.includes('tank');

      let result;

      if (hasHighEnergy) {
        let rule = 'Energy Isolation & Line of Fire';
        let energy = 'High Stored Pressure & Mechanical Tension';
        let barrier = 'Compromised Physical Barrier / Lockout Failure';

        if (lower.includes('height') || lower.includes('elevation') || lower.includes('scaffold')) {
          rule = 'Working at Height (LSR-05)';
          energy = 'Gravitational Energy Potential (>1.8m)';
          barrier = 'Inadequate Fall Restraint / Anchor Point Failure';
        } else if (lower.includes('gas') || lower.includes('h2s') || lower.includes('confined') || lower.includes('tank')) {
          rule = 'Confined Space (LSR-02)';
          energy = 'Toxic Atmospheric Hazard (H2S / O2 Deficiency)';
          barrier = 'Missing Continuous Atmospheric Testing & Ventilation';
        } else if (lower.includes('hot') || lower.includes('weld') || lower.includes('spark')) {
          rule = 'Hot Work (LSR-03)';
          energy = 'Thermal Ignition in Hydrocarbon Zone';
          barrier = 'Absence of Certified Fire Watch & LEL Screening';
        }

        result = {
          isSIF: true,
          sifScore: 94,
          sifCategory: 'High Potential SIF (pSIF)',
          iogpRule: rule,
          highEnergySource: energy,
          barrierStatus: barrier,
          recommendation: 'Trigger immediate automated SIF alert to Field HSSE Officer. Issue Stop Work Authority (SWA) pending physical barrier re-verification.'
        };
      } else {
        result = {
          isSIF: false,
          sifScore: 14,
          sifCategory: 'Non-SIF (Low Energy Hazard)',
          iogpRule: 'None (Standard HSSE Good Practice)',
          highEnergySource: 'No fatal-level energy source detected',
          barrierStatus: 'Routine administrative maintenance condition',
          recommendation: 'Log in monthly HSSE tracking register. Close through routine site supervisor housekeeping task.'
        };
      }

      setAnalysisResult(result);
      setAnalyzing(false);
    }, 600);
  };

  const handleSelectSample = (sample) => {
    setInputReport(sample.text);
    setAnalysisResult(sample.result);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0a1128] border border-slate-200 dark:border-slate-800 max-w-4xl w-full rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/25">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-white">
                Live AI/NLP SIF Precursor Detection Engine
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                NLP ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Problem ID: 26165 • Oil India Limited Safety Report Triage Simulator
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-mono font-bold uppercase text-slate-500 dark:text-slate-400">
            Quick Load OIL Sample Safety Incidents:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {sampleReports.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSelectSample(s)}
                className={`p-3 rounded-xl text-left border text-xs font-medium transition-all cursor-pointer ${
                  inputReport === s.text
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-amber-400/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px]">Sample #{s.id}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded ${s.result.isSIF ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {s.result.isSIF ? 'pSIF' : 'Non-SIF'}
                  </span>
                </div>
                <div className="line-clamp-1">{s.title}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold uppercase text-slate-500 dark:text-slate-400">
              Field Observation / Near-Miss Free-Text:
            </label>
            <span className="text-[11px] text-slate-400">Supports English & Oilfield Terminology</span>
          </div>
          <textarea
            rows={3}
            value={inputReport}
            onChange={(e) => setInputReport(e.target.value)}
            className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans leading-relaxed"
            placeholder="Enter or paste unsafe act, unsafe condition, or near-miss observation text..."
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => runAnalysis()}
            disabled={analyzing || !inputReport.trim()}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing NLP Vectorizer...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run AI SIF Classification</span>
              </>
            )}
          </button>
        </div>

        {analysisResult && (
          <div className={`p-5 rounded-2xl border space-y-4 transition-all ${
            analysisResult.isSIF
              ? 'bg-red-950/20 border-red-500/40 text-slate-900 dark:text-white'
              : 'bg-emerald-950/20 border-emerald-500/40 text-slate-900 dark:text-white'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
              <div className="flex items-center gap-2.5">
                {analysisResult.isSIF ? (
                  <div className="p-2 rounded-xl bg-red-500 text-white shadow-lg shadow-red-500/30">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <div className="text-xs font-mono uppercase text-slate-400">Classification Result</div>
                  <div className="text-lg font-black font-heading">
                    {analysisResult.sifCategory}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">Confidence Score:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-mono font-black ${
                  analysisResult.isSIF ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
                }`}>
                  {analysisResult.sifScore}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="font-mono text-slate-400 uppercase text-[10px] font-bold">
                  Mapped IOGP Life-Saving Rule:
                </span>
                <div className="font-bold text-amber-400 text-sm">
                  {analysisResult.iogpRule}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="font-mono text-slate-400 uppercase text-[10px] font-bold">
                  Detected High-Energy Source:
                </span>
                <div className="font-bold text-blue-400 text-sm">
                  {analysisResult.highEnergySource}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 text-xs">
              <span className="font-mono text-slate-400 uppercase text-[10px] font-bold">
                Critical Barrier Diagnosis:
              </span>
              <div className="font-medium text-amber-300">
                {analysisResult.barrierStatus}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 text-xs">
              <span className="font-mono text-slate-400 uppercase text-[10px] font-bold">
                Automated HSE Action Plan:
              </span>
              <p className="text-slate-300">
                {analysisResult.recommendation}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}