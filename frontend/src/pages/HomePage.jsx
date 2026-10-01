import React from 'react';
import { ArrowRight, ShieldCheck, Sparkles, Building2, Flame, Cpu, Eye, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function HomePage({ onNavigate, onOpenLogin, onOpenDemo }) {
  return (
    <div className="w-full text-white bg-[#07101F] selection:bg-amber-500 selection:text-slate-950">
      
      {/* 1. Cinematic Full-Screen Video Hero Section */}
      <section className="relative min-h-[92vh] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 overflow-hidden pt-28 pb-16">
        
        {/* Background Full Opacity Pure Video Stream */}
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-[#07101F]">
          <video
            src="/assets/videos/hero-video.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
          />
          {/* Subtle Contrast Gradients */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#07101F]/80 via-[#07101F]/40 to-[#07101F] z-10 pointer-events-none" />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 max-w-5xl mx-auto text-center space-y-6 my-auto">
          
          {/* Safety Intelligence Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-xs font-mono font-bold tracking-widest uppercase shadow-xl animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>OIL INDIA LIMITED HSSE PLATFORM</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[1.05] font-heading drop-shadow-[0_8px_30px_rgba(0,0,0,0.9)]">
            Where Every Safety Report Builds a <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">Zero-Incident</span> Tomorrow
          </h1>

          {/* Subheading */}
          <p className="max-w-3xl mx-auto text-base sm:text-xl text-slate-200 font-normal leading-relaxed drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
            Transform Unsafe Acts, Unsafe Conditions and Near-Miss Reports into proactive safety intelligence using domain-trained AI and NLP.
          </p>

          {/* Direct Exploration Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('about')}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-black text-sm tracking-wide shadow-2xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <span>Explore SafetyAI</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
            <button
              onClick={() => onNavigate('how-it-works')}
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 backdrop-blur-md hover:border-amber-400/60 transition-all duration-200 cursor-pointer hover:scale-105"
            >
              <span>See How It Works</span>
            </button>
          </div>

        </div>

        {/* Scroll Indicator with Thin Orange Line */}
        <div className="relative z-20 mt-12 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-bold">Discover</span>
          <div className="w-[2px] h-8 bg-gradient-to-b from-amber-400 to-transparent" />
        </div>
      </section>

      {/* 2. Visual Storytelling Showcase Section with Vertical Orange Line */}
      <section className="relative py-28 px-4 sm:px-6 lg:px-8 bg-[#07101F] overflow-hidden border-t border-slate-900">
        
        {/* Continuous Signature Vertical Orange Line */}
        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-[2px] bg-gradient-to-b from-amber-400 via-yellow-400 to-amber-500 opacity-60 z-0 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-24">
          
          {/* Story Block 1: Paradigm Shift */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-0 items-center">
            
            <div className="lg:col-span-6 lg:pr-16 text-left space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase">
                <Flame className="w-3.5 h-3.5" />
                <span>The SIF Paradigm Shift</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white font-heading leading-tight tracking-tight">
                Not All Incidents Are Created Equal
              </h2>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-light">
                Traditional safety pyramids assumed reducing minor injuries automatically eliminated fatalities. Scientific studies prove that minor incidents and fatal precursors have completely distinct root causes.
              </p>
              <div className="pt-2 flex items-baseline gap-4">
                <span className="text-5xl sm:text-6xl font-black text-amber-400 font-heading">20–25%</span>
                <span className="text-sm text-slate-300 max-w-xs font-medium">of industrial reports contain genuine high-energy fatal precursors.</span>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('about')}
                  className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-bold text-sm tracking-wide group cursor-pointer"
                >
                  <span>Learn about our Scientific Model</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 lg:pl-16">
              <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl group">
                <img
                  src="/assets/images/pic-2.jpg"
                  alt="Industrial Control Room"
                  className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07101F] via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-white/10 text-left">
                  <div className="text-xs font-mono text-amber-400 font-bold uppercase">SIF Triage Active</div>
                  <div className="text-base font-bold text-white">Continuous Real-Time Precursor Isolation</div>
                </div>
              </div>
            </div>

          </div>

          {/* Story Block 2: 6 Dedicated Pillars */}
          <div className="text-center max-w-4xl mx-auto pt-8 space-y-4">
            <h3 className="text-2xl sm:text-4xl font-bold text-white font-heading">
              Explore the SafetyAI Platform
            </h3>
            <p className="text-slate-400 text-sm sm:text-base">
              Navigate through dedicated interactive domains engineered for oil & gas industrial safety excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            
            {/* Nav Card 1 */}
            <div 
              onClick={() => onNavigate('how-it-works')}
              className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-amber-400/60 transition-all duration-300 group cursor-pointer text-left hover:-translate-y-1 shadow-xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Cpu className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2 font-heading group-hover:text-amber-400 transition-colors">
                How It Works
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Follow the 6-stage NLP parsing pipeline from raw multilingual field logs to proactive barrier alerts.
              </p>
              <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                Explore Workflow →
              </span>
            </div>

            {/* Nav Card 2 */}
            <div 
              onClick={() => onNavigate('sif-intelligence')}
              className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-amber-400/60 transition-all duration-300 group cursor-pointer text-left hover:-translate-y-1 shadow-xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2 font-heading group-hover:text-amber-400 transition-colors">
                SIF Intelligence
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Examine high-energy hazard vectors, barrier failure classification, and predictive weak signal analytics.
              </p>
              <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                Examine SIF Engine →
              </span>
            </div>

            {/* Nav Card 3 */}
            <div 
              onClick={() => onNavigate('life-saving-rules')}
              className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-amber-400/60 transition-all duration-300 group cursor-pointer text-left hover:-translate-y-1 shadow-xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Flame className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2 font-heading group-hover:text-amber-400 transition-colors">
                Life-Saving Rules
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Discover the 9 critical IOGP safety guardrails and barrier defense strategies for high-risk drilling.
              </p>
              <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                View Guardrails →
              </span>
            </div>

          </div>

        </div>

      </section>

      {/* 3. Enterprise Governance Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/10 border-t border-b border-slate-800">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-mono font-bold uppercase">
            <Building2 className="w-4 h-4" />
            <span>Oil India Limited Enterprise Portal</span>
          </div>
          <h3 className="text-3xl sm:text-4xl font-bold text-white font-heading">
            Access the Protected SIH PS #165 Command Center
          </h3>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Authorized safety executives and HSSE managers can access live rig analytics, precursor triage, and audit reporting.
          </p>
          <div className="pt-2">
            <button
              onClick={onOpenLogin}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-black text-sm tracking-wide shadow-2xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Building2 className="w-5 h-5" />
              <span>Organization Login</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
