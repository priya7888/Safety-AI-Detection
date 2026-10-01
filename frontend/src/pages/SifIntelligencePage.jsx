import React, { useState, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ShieldAlert, 
  Cpu, 
  Zap, 
  AlertOctagon, 
  Layers, 
  TrendingUp,
  Radio,
  Lock
} from 'lucide-react';

export default function SifIntelligencePage({ onNavigate, onOpenLogin, onOpenDemo }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const concepts = [
    {
      title: 'AI & NLP Analysis',
      icon: Cpu,
      tag: 'Semantic Engine',
      desc: 'Domain-trained language models analyze unstructured incident text, mobile logs, and supervisor notes to extract safety context.'
    },
    {
      title: 'SIF Precursor Detection',
      icon: ShieldAlert,
      tag: 'Fatal Potential',
      desc: 'Isolates events that involve high-energy sources combined with missing or compromised barrier controls.'
    },
    {
      title: 'High-Energy Hazard Identification',
      icon: Zap,
      tag: 'Energy Vectors',
      desc: 'Maps gravity (>1.8m), electrical (>50V), mechanical (pinch points), pressure (>100 psi), and toxic chemical releases.'
    },
    {
      title: 'Barrier Failure Detection',
      icon: AlertOctagon,
      tag: 'Bow-Tie Defense',
      desc: 'Classifies failure modes across Physical Hardware Interlocks, Administrative Permits (PTW), and Behavioral Controls.'
    },
    {
      title: 'Recurring Pattern Detection',
      icon: TrendingUp,
      tag: 'Systemic Risk',
      desc: 'Identifies systemic patterns across drilling rigs, gathering stations, and pipeline maintenance crews before accidents recur.'
    },
    {
      title: 'Weak Signal Detection',
      icon: Radio,
      tag: 'Early Warning',
      desc: 'Elevates low-level micro-observations that cluster across operational zones, signaling impending catastrophic barrier collapse.'
    }
  ];

  return (
    <div className="w-full text-slate-100 bg-[#07101F] selection:bg-amber-500 selection:text-slate-950 pt-24">
      
      {/* Header Banner */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#07101F] via-slate-900 to-[#07101F] border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>SIF INTELLIGENCE</span>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white font-heading tracking-tight leading-tight">
            Predictive High-Energy <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">
              SIF Precursor Detection
            </span>
          </h1>
          <p className="max-w-3xl mx-auto text-base sm:text-xl text-slate-300 font-light leading-relaxed">
            The AI system analyzes safety reports to identify potential Serious Injury and Fatality (SIF) precursors, ensuring zero data lag and 100% barrier assurance.
          </p>
        </div>
      </section>

      {/* Main Section with Video Stream & 6 Concept Cards */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        
        {/* Continuous Signature Vertical Orange Line */}
        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-[2px] bg-gradient-to-b from-amber-400 via-yellow-400 to-amber-500 opacity-60 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-24">
          
          {/* Row 1: Interactive Video Stream & Key Vector Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-0 items-center">
            
            {/* Left 4K Video Player */}
            <div className="lg:col-span-6 lg:pr-16">
              <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl group">
                <video
                  ref={videoRef}
                  src="/assets/videos/safety-analysis-video.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-80 sm:h-96 md:h-[420px] object-cover"
                />
                
                {/* Overlay Controls */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-white/10 text-white flex items-center justify-between shadow-xl">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlay}
                      className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 text-slate-950 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md font-bold"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <div>
                      <div className="text-xs font-mono text-amber-400 font-bold uppercase">Live AI Stream</div>
                      <div className="text-sm font-bold text-white">Automated Barrier Inspection</div>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold">
                    100% SECURE
                  </span>
                </div>
              </div>
            </div>

            {/* Right Story */}
            <div className="lg:col-span-6 lg:pl-16 space-y-6 text-left">
              <div className="text-xs font-mono text-amber-400 font-bold uppercase tracking-widest">
                ZERO-LAG FIELD INTELLIGENCE
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white font-heading leading-tight">
                Detect Hidden Safety Signals Before Incidents
              </h2>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-light">
                High-energy hazards (pressure, voltage, gravity, toxic gases) are analyzed instantly from field logs to protect teams during high-risk workover and refinery turnaround tasks.
              </p>

              <div className="space-y-3 pt-1">
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 rounded-full bg-amber-500/20 text-amber-400 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-slate-200">
                    <strong className="text-white">Live SIF Parsing:</strong> Instant energy vector & hazard identification
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 rounded-full bg-amber-500/20 text-amber-400 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-slate-200">
                    <strong className="text-white">IOGP Guardrails:</strong> Standardized life-saving rules compliance
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 rounded-full bg-amber-500/20 text-amber-400 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-slate-200">
                    <strong className="text-white">Zero Data Lag:</strong> Eliminates quarterly review backlogs completely
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={onOpenLogin}
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-black text-sm tracking-wide shadow-2xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Explore Safety Intelligence</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>

            </div>

          </div>

          {/* Row 2: 6 Core Concept Cards Grid */}
          <div className="space-y-8 pt-8">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <h3 className="text-2xl sm:text-4xl font-bold text-white font-heading">
                6 Pillars of SIF Precursor Intelligence
              </h3>
              <p className="text-slate-400 text-sm sm:text-base">
                How our AI platform analyzes safety data at enterprise scale to protect industrial personnel.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {concepts.map((concept, idx) => {
                const Icon = concept.icon;
                return (
                  <div 
                    key={idx}
                    className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-amber-400/60 transition-all duration-300 group text-left hover:-translate-y-1 shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {concept.tag}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-white font-heading mb-2 group-hover:text-amber-400 transition-colors">
                        {concept.title}
                      </h4>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        {concept.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </section>

      {/* Bottom CTA with Login Redirection */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 border-t border-slate-800 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-2xl sm:text-4xl font-bold text-white font-heading">
            Enterprise HSSE Portal Access
          </h3>
          <p className="text-slate-400 text-sm sm:text-base">
            Detailed precursor heatmaps, Bow-Tie barrier audits, and SPDI indices are protected for authorized Oil India Limited personnel.
          </p>
          <div className="pt-2">
            <button
              onClick={onOpenLogin}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-black text-sm tracking-wide shadow-2xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <span>Explore Safety Intelligence</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
