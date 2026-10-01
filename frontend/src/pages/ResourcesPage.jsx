import React from 'react';
import { 
  BookOpen, 
  Download, 
  FileText, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  FileDown,
  Layers,
  CheckCircle2
} from 'lucide-react';

export default function ResourcesPage({ onNavigate, onOpenLogin, onOpenDemo }) {
  const resourceCards = [
    {
      id: 1,
      title: 'Safety Awareness & Frontline Culture',
      category: 'Frontline Kit',
      type: 'PDF Guide • 2.4 MB',
      tag: 'Awareness',
      desc: 'Workforce safety education, hazard recognition toolkits, and proactive "See Something, Say Something" frontline reporting frameworks.',
      topics: ['Near-miss reporting guidelines', '5-minute toolbox talk templates', 'Stop Work Authority rights']
    },
    {
      id: 2,
      title: 'SIF Concepts & Precursor Science',
      category: 'Whitepaper',
      type: 'Whitepaper • 4.1 MB',
      tag: 'Scientific SIF',
      desc: 'Comprehensive breakdown of the EEI/DEKRA Serious Injury & Fatality model, energy vector thresholds, and why Heinrich pyramid logic fails.',
      topics: ['High-energy vector definitions', 'Precursor vs minor injury variance', 'Direct control reliability metrics']
    },
    {
      id: 3,
      title: 'Oilfield Safety Guidelines & SOPs',
      category: 'Standards Manual',
      type: 'Technical Standard • 5.8 MB',
      tag: 'Protocols',
      desc: 'Standardized field SOPs, Permit-to-Work (PTW) checklists, lockout/tagout procedures, and hazardous atmosphere testing standards.',
      topics: ['PTW issuance protocols', 'Hot work atmospheric testing rules', 'LOTO isolation confirmation steps']
    },
    {
      id: 4,
      title: 'AI Safety Intelligence Architecture',
      category: 'Technical Paper',
      type: 'System Architecture • 3.2 MB',
      tag: 'AI Technology',
      desc: 'In-depth documentation of natural language processing (NLP), transformer embeddings, and multilingual jargon tokenization for oilfield logs.',
      topics: ['Zero-lag semantic inference pipeline', 'Multilingual oilfield jargon dictionaries', 'Automated Bow-Tie mapping engine']
    },
    {
      id: 5,
      title: 'Industrial Safety Best Practices',
      category: 'IOGP Benchmark',
      type: 'Industry Benchmark • 3.9 MB',
      tag: 'Best Practices',
      desc: 'IOGP Report 459 life-saving rule compliance benchmarks and offshore/onshore drilling barrier assurance guidelines.',
      topics: ['9 Life-saving rules implementation', 'Emergency shutdown barrier verification', 'Management of Change (MOC) rigor']
    }
  ];

  return (
    <div className="w-full text-slate-100 bg-[#07101F] selection:bg-amber-500 selection:text-slate-950 pt-24">
      
      {/* Header Banner */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#07101F] via-slate-900 to-[#07101F] border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>KNOWLEDGE BASE & RESOURCES</span>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white font-heading tracking-tight leading-tight">
            Industrial Safety <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">
              Intelligence & Guidelines
            </span>
          </h1>
          <p className="max-w-3xl mx-auto text-base sm:text-xl text-slate-300 font-light leading-relaxed">
            Access whitepapers, SIF precursor frameworks, standardized field guidelines, and AI safety engineering documentation.
          </p>
        </div>
      </section>

      {/* Main Grid Section with Signature Vertical Line */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        
        {/* Continuous Signature Vertical Orange Line */}
        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-[2px] bg-gradient-to-b from-amber-400 via-yellow-400 to-amber-500 opacity-60 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-24">
          
          {/* Top Featured Split: Visual Image & Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-0 items-center">
            
            <div className="lg:col-span-6 lg:pr-16">
              <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl group">
                <img
                  src="/assets/images/pic-4.jpg"
                  alt="Refinery Operations"
                  className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07101F] via-transparent to-transparent opacity-85" />
                <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-white/10 text-left">
                  <div className="text-xs font-mono text-amber-400 font-bold uppercase">HSSE Knowledge Repository</div>
                  <div className="text-base font-bold text-white">Peer-Reviewed SIF Scientific Standards</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 lg:pl-16 space-y-6 text-left">
              <div className="text-xs font-mono text-amber-400 font-bold uppercase tracking-widest">
                OPEN ACCESS SAFETY REPOSITORY
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white font-heading leading-tight">
                Empowering Frontline Safety & Leadership
              </h2>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-light">
                SafetyAI pairs high-speed automated machine learning with standardized industry best practices. Download the frameworks and research papers that power our platform.
              </p>
              
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-3 text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Aligned with IOGP Report 459 & ISO 45001 Standards</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Practical field checklists ready for immediate toolbox deployment</span>
                </div>
              </div>
            </div>

          </div>

          {/* 5 Downloadable Resource Cards Grid */}
          <div className="space-y-8">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <h3 className="text-2xl sm:text-4xl font-bold text-white font-heading">
                5 Key Safety Intelligence Assets
              </h3>
              <p className="text-slate-400 text-sm sm:text-base">
                Download field-tested guidelines, AI whitepapers, and safety awareness publications.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resourceCards.map((res) => (
                <div 
                  key={res.id}
                  className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-amber-400/60 transition-all duration-300 group text-left hover:-translate-y-1 shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                        <FileText className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-md bg-slate-800 text-amber-300 border border-slate-700">
                        {res.tag}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-white font-heading mb-2 group-hover:text-amber-400 transition-colors">
                      {res.title}
                    </h4>

                    <div className="text-xs font-mono text-amber-400/90 mb-3 font-semibold">
                      {res.type}
                    </div>

                    <p className="text-sm text-slate-400 leading-relaxed mb-4">
                      {res.desc}
                    </p>

                    {/* Topics bullet points */}
                    <div className="space-y-1.5 pt-3 border-t border-slate-800">
                      {res.topics.map((top, tIdx) => (
                        <div key={tIdx} className="flex items-center gap-2 text-xs text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                          <span>{top}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 mt-4 border-t border-slate-800/80">
                    <button 
                      onClick={() => alert(`Downloading "${res.title}" documentation package...`)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Resource</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 border-t border-slate-800 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h3 className="text-2xl sm:text-4xl font-bold text-white font-heading">
            Need Enterprise Integration Support?
          </h3>
          <p className="text-slate-400 text-sm sm:text-base">
            Reach out to our oilfield safety engineers and HSSE AI deployment team for customized training and API access.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('contact')}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 cursor-pointer hover:scale-105 transition-all"
            >
              <span>Contact Us</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenLogin}
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/20 cursor-pointer"
            >
              <span>Organization Login</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
