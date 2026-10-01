import React from 'react';
import ReusableImage from './ReusableImage';
import { 
  Check, 
  ArrowRight, 
  ShieldAlert, 
  BookOpen,
  FileDown,
  DownloadCloud,
  Cpu
} from 'lucide-react';

export default function PhotoFeatureSection({ onExplore }) {
  const resources = [
    {
      title: 'Safety Awareness',
      tag: 'Awareness',
      desc: 'Workforce safety education, frontline hazard recognition toolkits, and proactive reporting culture.'
    },
    {
      title: 'SIF Concepts',
      tag: 'Scientific SIF',
      desc: 'In-depth guide to the EEI/DEKRA Serious Injury & Fatality precursor model and energy vectors.'
    },
    {
      title: 'Safety Guidelines',
      tag: 'Protocols',
      desc: 'Standardized field SOPs, PTW (Permit-to-Work) workflows, and operational check-lists.'
    },
    {
      title: 'AI Safety Intelligence',
      tag: 'AI Whitepaper',
      desc: 'Architectural documentation of LLM-driven unstructured hazard parsing and barrier auditing.'
    },
    {
      title: 'Industrial Safety Best Practices',
      tag: 'Best Practices',
      desc: 'IOGP 9 Life-Saving Rules compliance benchmarks and offshore drilling risk mitigation guidelines.'
    },
  ];

  return (
    <section 
      id="resources" 
      className="py-24 md:py-32 bg-[#FAF8F5] text-slate-900 relative transition-colors duration-300 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* 6th Page Layout: STRICT LEFT IMAGE | STRICT RIGHT TEXT (No crossing middle line) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-0 items-center">
          
          {/* LEFT SIDE: 3D Stacked Photo Card strictly on the left */}
          <div className="lg:col-span-6 lg:pr-14">
            <div className="relative group mx-auto max-w-md lg:max-w-none">
              
              {/* Stacked Shadow Card Layer 2 */}
              <div className="absolute inset-0 bg-yellow-200/50 rounded-3xl transform rotate-3 scale-95 transition-transform duration-500 group-hover:rotate-6 shadow-md" />
              
              {/* Stacked Shadow Card Layer 1 */}
              <div className="absolute inset-0 bg-amber-300/40 rounded-3xl transform -rotate-2 scale-98 transition-transform duration-500 group-hover:-rotate-4 shadow-lg" />
              
              {/* Foreground Image Card */}
              <div className="relative rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-2xl transition-transform duration-500 group-hover:scale-[1.01]">
                <img
                  src="/assets/images/pic-4.jpg"
                  alt="Refinery Heavy Machinery Defense"
                  className="w-full h-80 sm:h-96 md:h-[420px] object-cover"
                />

                {/* Glassy Tag Badge Overlay */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-slate-950/75 backdrop-blur-md border border-white/20 text-white flex items-center justify-between shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-mono text-amber-300 font-bold uppercase tracking-wider">High-Risk Detection</div>
                      <div className="text-sm font-bold text-white">Line of Fire & LOTO Defense</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-bold">
                    SIF-p TRIGGERED
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT SIDE: Text strictly on the right */}
          <div className="lg:col-span-6 lg:pl-14 space-y-6 text-left">
            
            {/* Category Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider shadow-sm">
              <Cpu className="w-3.5 h-3.5" />
              <span>Safety Intelligence Engine</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 text-slate-950 text-xs font-bold font-mono shadow-sm">
                05
              </span>
              <span className="text-xs font-mono font-bold tracking-widest text-amber-700 uppercase">
                ENTERPRISE RISK INTELLIGENCE
              </span>
            </div>

            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 font-heading leading-tight tracking-tight">
              Detect Risks Before They Become Incidents
            </h3>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Use AI and NLP to analyze safety reports, identify recurring patterns, detect barrier failures and highlight potential SIF precursors across all operational sites.
            </p>

            <div className="space-y-3.5 pt-1">
              {resources.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-amber-400/60 hover:bg-amber-50/40 transition-all duration-200 group">
                  <div className="mt-1 flex items-center justify-center w-6 h-6 rounded-lg bg-amber-500 text-slate-950 shrink-0 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform font-bold text-xs">
                    <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 font-heading">
                        {item.title}
                      </h4>
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-amber-100/80 text-amber-800 border border-amber-300/60">
                        {item.tag}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3">
              <button
                onClick={onExplore}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <span>Access Safety Resources</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}