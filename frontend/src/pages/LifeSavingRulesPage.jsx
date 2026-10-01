import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Flame, 
  ArrowRight, 
  Lock, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  HardHat, 
  EyeOff, 
  Compass, 
  Truck, 
  PowerOff,
  Sparkles
} from 'lucide-react';

export default function LifeSavingRulesPage({ onNavigate, onOpenLogin, onOpenDemo }) {
  const [selectedRule, setSelectedRule] = useState(null);

  const rules = [
    {
      id: 1,
      title: 'Working at Height',
      category: 'Fall Protection',
      icon: HardHat,
      color: 'from-amber-500 to-yellow-600',
      rule: 'Protect yourself against a fall when working at height (> 1.8m).',
      controls: [
        '100% tie-off with full-body harness & shock-absorbing lanyard',
        'Scaffold inspected & certified with green tag',
        'Fall arrest systems anchored to rated attachment points'
      ],
      hazard: 'Gravity Energy Vector — Fall from drill floor, derrick, or tank tops.'
    },
    {
      id: 2,
      title: 'Confined Space',
      category: 'Atmospheric Safety',
      icon: EyeOff,
      color: 'from-orange-500 to-amber-600',
      rule: 'Obtain authorization before entering a confined space.',
      controls: [
        'Continuous 4-gas atmospheric testing (O2, H2S, LEL, CO)',
        'Positive mechanical ventilation active',
        'Dedicated standby watchman positioned at entry'
      ],
      hazard: 'Toxic / Asphyxiation Vector — Toxic gas accumulation or oxygen depletion in separators & tanks.'
    },
    {
      id: 3,
      title: 'Energy Isolation (LOTO)',
      category: 'Isolation Controls',
      icon: PowerOff,
      color: 'from-yellow-500 to-amber-500',
      rule: 'Verify isolation and zero energy state before work begins.',
      controls: [
        'Lockout/Tagout applied on electrical breakers & valves',
        'Zero-energy state verified via bleed-off & multimeter test',
        'Mechanical blinds / spades installed for positive isolation'
      ],
      hazard: 'Electrical & Pressure Vectors — Unexpected energization or pressurized fluid ejection.'
    },
    {
      id: 4,
      title: 'Hot Work',
      category: 'Fire & Explosion',
      icon: Flame,
      color: 'from-red-500 to-amber-600',
      rule: 'Control flammables and ignition sources in hazardous zones.',
      controls: [
        'Valid Hot Work Permit issued by authorized gas tester',
        'Combustible materials removed or covered with fire blankets',
        'Continuous gas monitor & dedicated fire watch with extinguisher'
      ],
      hazard: 'Thermal & Chemical Vector — Hydrocarbon ignition in refinery or gathering station zones.'
    },
    {
      id: 5,
      title: 'Lifting Operations',
      category: 'Suspended Load',
      icon: Compass,
      color: 'from-amber-400 to-yellow-500',
      rule: 'Follow the lifting plan and never walk under a suspended load.',
      controls: [
        'Rigging gear inspected and color-coded for valid inspection quarter',
        'Exclusion zone barricaded with safety tape and spotters stationed',
        'Lift weight within certified Safe Working Load (SWL)'
      ],
      hazard: 'Mechanical & Gravity Vectors — Dropped object during crane lifting or pipe handling.'
    },
    {
      id: 6,
      title: 'PPE Compliance',
      category: 'Personal Protection',
      icon: ShieldAlert,
      color: 'from-blue-500 to-cyan-600',
      rule: 'Wear task-specific personal protective equipment at all times.',
      controls: [
        'Flame-resistant coveralls (FRC) & safety boots with steel toe/shank',
        'Impact-resistant eye protection and hardhat with chinstrap',
        'Specialized chemical gloves, face shields, and respirators as required'
      ],
      hazard: 'Physical & Chemical Vectors — Direct contact with high-temperature surfaces or chemical splashes.'
    },
    {
      id: 7,
      title: 'Line of Fire',
      category: 'Stored Energy',
      icon: AlertTriangle,
      color: 'from-amber-600 to-yellow-600',
      rule: 'Position yourself away from moving machinery and release paths.',
      controls: [
        'Maintain visual contact with heavy equipment operators',
        'Stay clear of pressurized hose sweep paths and whip checks secured',
        'Identify crush zones during pipe makeup on rig floor'
      ],
      hazard: 'Kinetic & Pressure Vectors — Being struck by moving rotary tools or parted cables.'
    },
    {
      id: 8,
      title: 'Bypassing Safety Controls',
      category: 'Barrier Management',
      icon: Lock,
      color: 'from-indigo-500 to-blue-600',
      rule: 'Obtain authorization before overriding or disabling safety systems.',
      controls: [
        'Formal Management of Change (MOC) approved by HSSE lead',
        'Temporary compensatory barriers established and documented',
        'Time-bound bypass tracking in control room log'
      ],
      hazard: 'Systemic Vector — Disabling ESD (Emergency Shutdown) or relief valve interlocks.'
    },
    {
      id: 9,
      title: 'Driving Safety',
      category: 'Vehicle Transport',
      icon: Truck,
      color: 'from-emerald-500 to-teal-600',
      rule: 'Always wear seatbelts and obey speed limits across field routes.',
      controls: [
        'Journey Management Plan approved before long-distance transit',
        'In-Vehicle Monitoring System (IVMS) tracking speed & harsh braking',
        'Zero mobile phone use while driving across oilfield roads'
      ],
      hazard: 'Kinetic Energy Vector — Vehicle rollover on remote oilfield access tracks.'
    }
  ];

  return (
    <div className="w-full text-slate-100 bg-[#07101F] selection:bg-amber-500 selection:text-slate-950 pt-24">
      
      {/* Header Banner */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#07101F] via-slate-900 to-[#07101F] border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>IOGP LIFE-SAVING RULES</span>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white font-heading tracking-tight leading-tight">
            Standardized Barrier <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">
              Guardrails & Compliance
            </span>
          </h1>
          <p className="max-w-3xl mx-auto text-base sm:text-xl text-slate-300 font-light leading-relaxed">
            Critical safety behaviors and high-consequence hazards mapped across all oilfield operations. See how SafetyAI automatically monitors and verifies compliance.
          </p>
        </div>
      </section>

      {/* Main Grid Section with Signature Vertical Line */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        
        {/* Continuous Signature Vertical Orange Line */}
        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-[2px] bg-gradient-to-b from-amber-400 via-yellow-400 to-amber-500 opacity-60 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-20">
          
          <div className="text-center max-w-4xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-4xl font-bold text-white font-heading">
              9 Core Life-Saving Rules
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Click any rule below to expand required barrier controls, primary energy hazards, and AI compliance rules.
            </p>
          </div>

          {/* Attractive 9-in-1 Rule Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rules.map((rule) => {
              const Icon = rule.icon;
              const isSelected = selectedRule?.id === rule.id;
              return (
                <div
                  key={rule.id}
                  onClick={() => setSelectedRule(isSelected ? null : rule)}
                  className={`p-7 rounded-3xl border transition-all duration-300 cursor-pointer text-left flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-amber-400 ring-2 ring-amber-500/30 shadow-2xl scale-[1.02]'
                      : 'bg-slate-900/80 border-slate-800 hover:border-amber-400/60 hover:-translate-y-1 shadow-xl'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-md bg-slate-800 text-amber-300 border border-slate-700">
                        {rule.category}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white font-heading mb-2">
                      {rule.title}
                    </h3>

                    <p className="text-sm text-slate-300 font-medium leading-relaxed mb-4">
                      "{rule.rule}"
                    </p>

                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-amber-400/90 font-mono mb-4">
                      ⚠ {rule.hazard}
                    </div>

                    {/* Expandable Controls */}
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <div className="text-[11px] font-mono font-bold text-slate-400 uppercase">
                        Required Controls:
                      </div>
                      {rule.controls.map((ctrl, cIdx) => (
                        <div key={cIdx} className="flex items-start gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{ctrl}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">Rule #{rule.id}</span>
                    <span className="text-xs font-mono font-bold text-amber-400">AI Tagging Active ✓</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 border-t border-slate-800 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h3 className="text-2xl sm:text-4xl font-bold text-white font-heading">
            Access Safety Knowledge & Whitepapers
          </h3>
          <p className="text-slate-400 text-sm sm:text-base">
            Explore downloadable guidelines, SIF scientific concepts, and frontline awareness kits.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('resources')}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 cursor-pointer hover:scale-105 transition-all"
            >
              <span>Explore Resources</span>
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
