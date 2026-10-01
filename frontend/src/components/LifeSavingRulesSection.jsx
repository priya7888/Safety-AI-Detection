import React, { useState } from 'react';
import {
  Zap,
  DoorClosed,
  Flame,
  Crosshair,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Play,
  Anchor,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  Activity,
  X
} from 'lucide-react';

export default function LifeSavingRulesSection() {
  const rules = [
    {
      id: 'energy-isolation',
      title: 'Energy Isolation',
      icon: Zap,
      code: 'LSR-01',
      vectorTag: '⚡ High Pressure & Electrical',
      iconBg: 'from-amber-400 to-amber-600',
      cardBg: 'bg-gradient-to-br from-[#18130B]/95 via-[#101017] to-[#0B0B10]',
      borderColor: 'border-amber-500/30 hover:border-amber-400',
      activeBorder: 'border-amber-400 ring-2 ring-amber-400/30 shadow-[0_0_25px_rgba(245,158,11,0.25)]',
      shadowColor: 'hover:shadow-[0_10px_30px_rgba(245,158,11,0.20)]',
      accentText: 'text-amber-400',
      accentBg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
      flareBg: 'bg-amber-500/20',
      btnBg: 'bg-amber-500/15 text-amber-400 group-hover:bg-amber-400 group-hover:text-slate-950',
      shortDescription:
        'Verify isolation and zero energy state before starting work on electrical, mechanical, or pressure systems.',
      energyHazard:
        'High Pressure (>150 PSI), Electrical (>50V), Hydraulic, Pneumatic stored charge',
      criticalBarriers: [
        'Lockout / Tagout (LOTO) padlocks applied to primary isolation points',
        'Physical depressurization tested with calibrated multi-meter and bleed gauge',
        'Formal isolation certificate signed by authorized HSE supervisor'
      ],
      nlpKeywords: [
        'loto',
        'isolation',
        'lockout',
        'breaker',
        'pressurized line',
        'zero energy'
      ],
      preventionBarrier: 'Hardware Padlock & Hasps',
      mitigationBarrier: 'Secondary Vent Bleed Valves'
    },
    {
      id: 'confined-space',
      title: 'Confined Space',
      icon: DoorClosed,
      code: 'LSR-02',
      vectorTag: '💨 Toxic H2S & O2 Depletion',
      iconBg: 'from-cyan-400 to-blue-600',
      cardBg: 'bg-gradient-to-br from-[#0B151F]/95 via-[#101017] to-[#0B0B10]',
      borderColor: 'border-cyan-500/30 hover:border-cyan-400',
      activeBorder: 'border-cyan-400 ring-2 ring-cyan-400/30 shadow-[0_0_25px_rgba(6,182,212,0.25)]',
      shadowColor: 'hover:shadow-[0_10px_30px_rgba(6,182,212,0.20)]',
      accentText: 'text-cyan-400',
      accentBg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
      flareBg: 'bg-cyan-500/20',
      btnBg: 'bg-cyan-500/15 text-cyan-400 group-hover:bg-cyan-400 group-hover:text-slate-950',
      shortDescription:
        'Obtain authorization, verify atmospheric testing, and ensure rescue stand-by before entering enclosed spaces.',
      energyHazard:
        'Asphyxiation (O2 < 19.5%), Toxic H2S Gas (>10 PPM), Explosive LEL vapors',
      criticalBarriers: [
        'Calibrated 4-gas continuous atmospheric monitor prior to vessel entry',
        'Continuous positive mechanical forced-air ventilation running during occupancy',
        'Dedicated standby hole-watch sentry equipped with emergency escape SCBA'
      ],
      nlpKeywords: [
        'confined space',
        'tank entry',
        'gas test',
        'h2s',
        'oxygen deficiency',
        'vessel'
      ],
      preventionBarrier: 'Continuous 4-Gas Detector',
      mitigationBarrier: 'Standby Rescue Watch & SCBA'
    },
    {
      id: 'hot-work',
      title: 'Hot Work',
      icon: Flame,
      code: 'LSR-03',
      vectorTag: '🔥 Flash Fire & Ignition',
      iconBg: 'from-orange-500 to-red-600',
      cardBg: 'bg-gradient-to-br from-[#1C0F0A]/95 via-[#101017] to-[#0B0B10]',
      borderColor: 'border-orange-500/30 hover:border-orange-400',
      activeBorder: 'border-orange-400 ring-2 ring-orange-400/30 shadow-[0_0_25px_rgba(249,115,22,0.25)]',
      shadowColor: 'hover:shadow-[0_10px_30px_rgba(249,115,22,0.20)]',
      accentText: 'text-orange-400',
      accentBg: 'bg-orange-500/10 border-orange-500/30 text-orange-300',
      flareBg: 'bg-orange-500/20',
      btnBg: 'bg-orange-500/15 text-orange-400 group-hover:bg-orange-400 group-hover:text-slate-950',
      shortDescription:
        'Control ignition sources and verify continuous gas monitoring prior to welding or open-flame jobs.',
      energyHazard:
        'Hydrocarbon Gas Flash Fire, Explosion, Thermal Radiation',
      criticalBarriers: [
        'Hot work permit with calibrated LEL < 1% verification within 15m perimeter',
        'Pressurized fire hose and certified fire watch assigned with charged extinguisher',
        'Flame-retardant welding habitat and spark-containment fire blankets deployed'
      ],
      nlpKeywords: [
        'hot work',
        'welding',
        'spark',
        'cutting torch',
        'lel test',
        'flame'
      ],
      preventionBarrier: 'LEL Gas Sniffer Interlock',
      mitigationBarrier: 'Fire Watch & Pressurized Water Line'
    },
    {
      id: 'line-of-fire',
      title: 'Line of Fire',
      icon: Crosshair,
      code: 'LSR-04',
      vectorTag: '🎯 Kinetic Impact & Crush',
      iconBg: 'from-rose-400 to-pink-600',
      cardBg: 'bg-gradient-to-br from-[#1C0A12]/95 via-[#101017] to-[#0B0B10]',
      borderColor: 'border-rose-500/30 hover:border-rose-400',
      activeBorder: 'border-rose-400 ring-2 ring-rose-400/30 shadow-[0_0_25px_rgba(244,63,94,0.25)]',
      shadowColor: 'hover:shadow-[0_10px_30px_rgba(244,63,94,0.20)]',
      accentText: 'text-rose-400',
      accentBg: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
      flareBg: 'bg-rose-500/20',
      btnBg: 'bg-rose-500/15 text-rose-400 group-hover:bg-rose-400 group-hover:text-slate-950',
      shortDescription:
        'Position yourself outside trajectory zones of moving equipment, pressurized release, and suspended loads.',
      energyHazard:
        'Kinetic Impact (>10 kJ), Stored Spring Energy, High-Pressure Excursion',
      criticalBarriers: [
        'Physical exclusion zone red-barricades installed beneath slewing radius',
        'Secondary retention lines & certified whip-checks installed on dynamic hoses',
        'Active machine optical proximity sensors & radio communication verified'
      ],
      nlpKeywords: [
        'line of fire',
        'pinch point',
        'crush hazard',
        'whip check',
        'suspended load'
      ],
      preventionBarrier: 'Hard Exclusion Barricade',
      mitigationBarrier: 'Steel Whip-Check Cables'
    },
    {
      id: 'working-at-height',
      title: 'Working at Height',
      icon: Anchor,
      code: 'LSR-05',
      vectorTag: '⚓ Gravitational Fall Risk',
      iconBg: 'from-indigo-400 to-purple-600',
      cardBg: 'bg-gradient-to-br from-[#130E1F]/95 via-[#101017] to-[#0B0B10]',
      borderColor: 'border-indigo-500/30 hover:border-indigo-400',
      activeBorder: 'border-indigo-400 ring-2 ring-indigo-400/30 shadow-[0_0_25px_rgba(99,102,241,0.25)]',
      shadowColor: 'hover:shadow-[0_10px_30px_rgba(99,102,241,0.20)]',
      accentText: 'text-indigo-400',
      accentBg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300',
      flareBg: 'bg-indigo-500/20',
      btnBg: 'bg-indigo-500/15 text-indigo-400 group-hover:bg-indigo-400 group-hover:text-slate-950',
      shortDescription:
        'Protect against falls by inspecting harnesses, verifying 100% tie-off, and securing scaffold green tags.',
      energyHazard:
        'Gravitational Fall Potential (>1.8m Elevation), Dropped Objects',
      criticalBarriers: [
        '100% double-lanyard tie-off to certified load-rated anchor points',
        'Daily scaffold green-tag inspection verified with rigid toe-boards',
        'Heavy tool tethers and secondary fine debris drop-netting installed'
      ],
      nlpKeywords: [
        'working at height',
        'fall arrest',
        'scaffold green tag',
        'harness',
        'tie off'
      ],
      preventionBarrier: 'Certified Anchor Points & Lanyards',
      mitigationBarrier: 'Debris Netting & Shock Absorbers'
    },
    {
      id: 'bypass-safety-controls',
      title: 'Bypassing Controls',
      icon: ShieldCheck,
      code: 'LSR-06',
      vectorTag: '🛡️ Safety Critical Defeat',
      iconBg: 'from-emerald-400 to-teal-600',
      cardBg: 'bg-gradient-to-br from-[#0B1A14]/95 via-[#101017] to-[#0B0B10]',
      borderColor: 'border-emerald-500/30 hover:border-emerald-400',
      activeBorder: 'border-emerald-400 ring-2 ring-emerald-400/30 shadow-[0_0_25px_rgba(16,185,129,0.25)]',
      shadowColor: 'hover:shadow-[0_10px_30px_rgba(16,185,129,0.20)]',
      accentText: 'text-emerald-400',
      accentBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
      flareBg: 'bg-emerald-500/20',
      btnBg: 'bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-400 group-hover:text-slate-950',
      shortDescription:
        'Obtain formal management authorization before overriding or isolating any safety-critical ESD device.',
      energyHazard:
        'Loss of Primary Containment (LOPC), Overpressure Runaway, Toxic Gas Cloud',
      criticalBarriers: [
        'Formal Safety Critical Element (SCE) override permit signed by Asset Manager',
        'Compensatory manual mitigation active in central control room with dedicated watch',
        'Time-limited override with automated 24-hour expiration alert and lock'
      ],
      nlpKeywords: [
        'bypass',
        'safety override',
        'esd defeat',
        'interlock disabled',
        'psv isolated'
      ],
      preventionBarrier: 'Management Authorization Permit',
      mitigationBarrier: 'Control Room Compensatory Watch'
    }
  ];

  // Currently inspected rule for the right-side interactive card
  const [inspectRule, setInspectRule] = useState(null);
  const [activeTab, setActiveTab] = useState('barriers'); // 'barriers' | 'bowtie' | 'ai'
  const [activeBarrierIdx, setActiveBarrierIdx] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [scanCompleted, setScanCompleted] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState(null);

  const handleOpenInspect = (rule) => {
    setInspectRule(rule);
    setActiveTab('barriers');
    setActiveBarrierIdx(0);
    setIsScanning(false);
    setScanCompleted(false);
    setSelectedKeyword(null);
  };

  const handleCloseInspect = () => {
    setInspectRule(null);
  };

  const handlePrevRule = () => {
    const currentIndex = rules.findIndex((r) => r.id === inspectRule.id);
    const prevIndex = (currentIndex - 1 + rules.length) % rules.length;
    setInspectRule(rules[prevIndex]);
    setActiveBarrierIdx(0);
    setIsScanning(false);
    setScanCompleted(false);
    setSelectedKeyword(null);
  };

  const handleNextRule = () => {
    const currentIndex = rules.findIndex((r) => r.id === inspectRule.id);
    const nextIndex = (currentIndex + 1) % rules.length;
    setInspectRule(rules[nextIndex]);
    setActiveBarrierIdx(0);
    setIsScanning(false);
    setScanCompleted(false);
    setSelectedKeyword(null);
  };

  const handleSimulateScan = () => {
    setIsScanning(true);
    setScanCompleted(false);
    setTimeout(() => {
      setIsScanning(false);
      setScanCompleted(true);
    }, 600);
  };

  return (
    <section
      id="life-saving-rules"
      className="py-16 md:py-24 bg-[#070709] text-white relative transition-colors duration-300 overflow-hidden"
    >
      {/* BACKGROUND SOFT AMBIENT GLOWS */}
      <div className="absolute top-1/4 left-10 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* FULL-WIDTH FLUID CANVAS UTILIZING 100% REMAINING SCREEN SPACE */}
      <div className="relative z-10 w-full px-6 sm:px-8 md:px-12 lg:px-14 xl:px-18 2xl:px-24">

        {/* =========================================================================
            TWO-COLUMN FULL-BLEED SECTION (100% EDGE-TO-EDGE):
            - LEFT 50% (lg:col-span-6 lg:pr-12 xl:pr-16): MATTER PRESENT IN 2ND PAGE
            - CENTER (50% / left-1/2): GOLDEN ROPE SCROLLER PASSES CLEANLY THROUGH GUTTER
            - RIGHT 50% (lg:col-span-6 lg:pl-12 xl:pl-16): 6 CARDS FILLING ALL REMAINING SPACE
        ========================================================================= */}
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-0 w-full">
          
          {/* =========================================================================
              LEFT COLUMN: MATTER THAT WAS PRESENT IN SECOND PAGE
              - Generously expands across the entire left half of screen
              - Badge: IOGP Standard Guardrails • 6 Rules
              - Heading: Standardized Defense Against Fatal Trajectories
              - Subtitle / Description (No artificial width caps)
              - 3 Highlight Defense Pills (Full width across left column)
          ========================================================================= */}
          <div className="space-y-6 sm:space-y-7 text-left flex flex-col justify-center lg:col-span-6 lg:pr-12 xl:pr-16 w-full">
            
            {/* SECTION BADGE */}
            <div className="inline-flex items-center gap-2.5 px-4.5 py-2 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-bold uppercase tracking-wider backdrop-blur-md shadow-sm shadow-amber-500/10 w-fit">
              <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>IOGP Standard Guardrails • 6 Rules</span>
            </div>

            {/* MAIN HEADING */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white font-heading leading-[1.12] tracking-tight w-full">
              Standardized Defense Against{' '}
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
                Fatal Trajectories
              </span>
            </h2>

            {/* DESCRIPTION (Expands across full left half) */}
            <p className="text-sm sm:text-base xl:text-lg text-slate-300 leading-relaxed font-normal w-full">
              Our AI engine automatically maps free-text field reports and near-misses against standardized IOGP Life-Saving Rules to detect critical barrier failures and high-energy vectors in real-time.
            </p>

            {/* 3 HIGHLIGHT DEFENSE PILLS (Full width across left column) */}
            <div className="space-y-3.5 pt-1 w-full">
              <div className="flex items-center gap-3.5 px-5 py-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-amber-500/30 transition-colors text-xs sm:text-sm xl:text-base font-medium text-slate-200 w-full shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                <span>Zero-Energy State &amp; LOTO Isolation</span>
              </div>
              
              <div className="flex items-center gap-3.5 px-5 py-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-cyan-500/30 transition-colors text-xs sm:text-sm xl:text-base font-medium text-slate-200 w-full shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                <span>Atmospheric &amp; Continuous Gas Checks</span>
              </div>
              
              <div className="flex items-center gap-3.5 px-5 py-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-rose-500/30 transition-colors text-xs sm:text-sm xl:text-base font-medium text-slate-200 w-full shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-rose-400 shrink-0" />
                <span>100% Tie-Off &amp; Line of Fire Barriers</span>
              </div>
            </div>

            {/* STATUS HINT */}
            <div className="pt-1 text-xs sm:text-sm text-slate-400 font-mono flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <span>Click arrow on any rule to inspect barrier verification</span>
            </div>

          </div>

          {/* =========================================================================
              RIGHT COLUMN: 6 CARDS OR IN-PLACE INSPECTION CARD (ON THE SAME SIDE)
              - Strictly on the RIGHT half (lg:col-span-6 lg:pl-12 xl:pl-16)
              - When inspecting: Displays as a CARD on the same side
              - "dont touch the arrow": The arrow buttons on the cards remain pure and untouched
              - "remove clik to verify buttond give it as mattre": Pure matter, no checkbox buttons
          ========================================================================= */}
          <div className="flex flex-col justify-center lg:col-span-6 lg:pl-12 xl:pl-16 w-full">
            {inspectRule ? (
              /* =========================================================================
                  INSPECTION CARD: EXACTLY THE 4 CONTENT BLOCKS (WHITE THEME)
                  1. Mandatory Operational Guardrail
                  2. High-Energy Hazard Signature
                  3. Critical Defense Barriers
                  4. NLP Signatures
                  Top: Header with Rule Icon, Title, and 'X' close symbol
              ========================================================================= */
              <div
                className="
                  w-full
                  max-w-xl
                  mx-auto
                  bg-white
                  rounded-2xl
                  border
                  border-slate-200
                  p-5
                  sm:p-6
                  shadow-2xl
                  space-y-3.5
                  text-left
                  transition-all
                  duration-300
                  relative
                  overflow-hidden
                  animate-in
                  fade-in
                  duration-200
                "
              >
                {/* TOP 'X' (INTO) CLOSE SYMBOL */}
                <button
                  type="button"
                  onClick={handleCloseInspect}
                  className="
                    absolute
                    top-3
                    right-3
                    sm:top-3.5
                    sm:right-3.5
                    w-7
                    h-7
                    rounded-full
                    bg-slate-100
                    hover:bg-slate-200
                    text-slate-500
                    hover:text-slate-900
                    flex
                    items-center
                    justify-center
                    transition-colors
                    cursor-pointer
                    z-20
                    shadow-xs
                  "
                  title="Close inspection"
                  aria-label="Close inspection"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>

                {/* 1. MANDATORY OPERATIONAL GUARDRAIL */}
                <div className="relative p-3.5 pr-10 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-1">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    MANDATORY OPERATIONAL GUARDRAIL
                  </span>
                  <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-normal">
                    {inspectRule.shortDescription}
                  </p>
                </div>

                {/* 2. HIGH-ENERGY HAZARD SIGNATURE */}
                <div className="p-3.5 rounded-xl bg-[#fffbeb] border border-amber-300/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs uppercase font-mono tracking-wide">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>HIGH-ENERGY HAZARD SIGNATURE:</span>
                  </div>
                  <p className="text-xs sm:text-[13.5px] text-amber-950 font-bold leading-relaxed">
                    {inspectRule.energyHazard}
                  </p>
                </div>

                {/* 3. CRITICAL DEFENSE BARRIERS */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-mono uppercase font-bold text-slate-800 tracking-wider">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>CRITICAL DEFENSE BARRIERS:</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">Click barrier to inspect</span>
                  </div>

                  <div className="space-y-2">
                    {inspectRule.criticalBarriers.map((barrier, idx) => {
                      const isActive = activeBarrierIdx === idx;
                      return (
                        <div
                          key={idx}
                          onClick={() => setActiveBarrierIdx(idx)}
                          className={`
                            flex
                            items-start
                            gap-3
                            p-3
                            rounded-xl
                            border
                            transition-all
                            cursor-pointer
                            ${
                              isActive
                                ? 'bg-amber-50/50 border-amber-400 shadow-xs ring-1 ring-amber-400/30'
                                : 'bg-slate-50/40 border-slate-200/80 hover:bg-slate-100/60'
                            }
                          `}
                        >
                          <div
                            className={`
                              w-2.5
                              h-2.5
                              rounded-full
                              mt-1
                              shrink-0
                              ${isActive ? 'bg-amber-500 ring-4 ring-amber-200' : 'bg-emerald-500 ring-4 ring-emerald-100'}
                            `}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-[13px] font-semibold leading-relaxed text-slate-800">
                              {barrier}
                            </p>
                            <div className="mt-1 flex items-center justify-between text-[10px] font-mono">
                              <span className="text-slate-400">
                                {idx === 0 ? 'Primary Prevention Barrier' : idx === 1 ? 'Secondary Verification Barrier' : 'Administrative Governance'}
                              </span>
                              <span className="text-emerald-700 font-bold">
                                • Telemetry Active
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. NLP SIGNATURES */}
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-[10.5px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                    <Cpu className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>NLP SIGNATURES:</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {inspectRule.nlpKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[10.5px] font-mono text-slate-700 font-medium"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              /* =========================================================================
                  6 CARDS GRID (UNTOUCHED ARROWS)
                  - 2-column grid (3 rows x 2 cards)
                  - Clean circular arrow buttons with NO text
              ========================================================================= */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 xl:gap-6 auto-rows-fr w-full">
                {rules.map((rule) => {
                  const Icon = rule.icon;
                  const isSelected = inspectRule?.id === rule.id;

                  return (
                    <div
                      key={rule.id}
                      onClick={() => handleOpenInspect(rule)}
                      className={`
                        group
                        relative
                        h-full
                        w-full
                        ${rule.cardBg}
                        rounded-2xl
                        p-4
                        sm:p-5
                        xl:p-5.5
                        border
                        ${isSelected ? rule.activeBorder : `${rule.borderColor} hover:border-white/30`}
                        shadow-md
                        ${rule.shadowColor}
                        transition-all
                        duration-300
                        cursor-pointer
                        flex
                        items-center
                        justify-between
                        gap-3.5
                        overflow-hidden
                      `}
                    >
                      {/* AMBIENT FLARE GLOW ON ACTIVE/HOVER */}
                      <div
                        className={`
                          absolute
                          -top-12
                          -right-12
                          w-36
                          h-36
                          ${rule.flareBg}
                          rounded-full
                          blur-xl
                          ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'}
                          transition-opacity
                          duration-500
                          pointer-events-none
                        `}
                      />

                      {/* ACTIVE INDICATOR BAR ON LEFT */}
                      {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-400 via-orange-400 to-amber-200" />
                      )}

                      {/* ==================================================
                          LEFT SIDE OF CARD: ALL THE MATTER
                          (Icon, Code Badge, Title, Description, Vector Tag)
                      ================================================== */}
                      <div className="relative z-10 flex-1 min-w-0 pr-2 flex flex-col justify-center text-left">
                        
                        {/* TOP ROW: ICON + CODE + TITLE */}
                        <div className="flex items-center gap-2 sm:gap-2.5 mb-2 flex-wrap">
                          {/* Icon */}
                          <div
                            className={`
                              w-8
                              h-8
                              sm:w-8.5
                              sm:h-8.5
                              rounded-xl
                              bg-gradient-to-br
                              ${rule.iconBg}
                              text-slate-950
                              flex
                              items-center
                              justify-center
                              shadow-sm
                              group-hover:scale-105
                              transition-transform
                              shrink-0
                            `}
                          >
                            <Icon className="w-4 h-4 stroke-[2.5]" />
                          </div>

                          {/* Code Badge */}
                          <span
                            className={`
                              inline-flex
                              items-center
                              gap-1.5
                              px-2
                              py-0.5
                              rounded-full
                              text-[10.5px]
                              font-mono
                              font-bold
                              border
                              ${rule.accentBg}
                            `}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                            {rule.code}
                          </span>

                          {/* Title */}
                          <h3 className="text-sm sm:text-base font-bold font-heading text-white tracking-tight truncate group-hover:text-amber-300 transition-colors">
                            {rule.title}
                          </h3>
                        </div>

                        {/* Description ("Matter left of the arrow") */}
                        <p className="text-xs sm:text-[13px] text-slate-300/90 leading-relaxed mb-2.5 line-clamp-2 min-h-[2.5rem]">
                          {rule.shortDescription}
                        </p>

                        {/* Vector Tag */}
                        <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-[10px] sm:text-[11px] font-mono text-slate-300 w-fit">
                          {rule.vectorTag}
                        </div>
                      </div>

                      {/* ==================================================
                          RIGHT SIDE OF CARD: RIGHT ARROW BUTTON
                          CRITICAL: AT ARROW ABSOLUTELY NOTHING COMES
                          (NO TEXT, NO LABELS - PURE ARROW BUTTON)
                      ================================================== */}
                      <div className="relative z-10 shrink-0 self-center flex items-center justify-center pl-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenInspect(rule);
                          }}
                          className={`
                            w-10
                            h-10
                            sm:w-11
                            sm:h-11
                            rounded-full
                            ${
                              isSelected 
                                ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/30 scale-105 ring-2 ring-amber-400/40' 
                                : 'bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-md shadow-amber-400/20'
                            }
                            flex
                            items-center
                            justify-center
                            transition-all
                            duration-300
                            group-hover:scale-110
                            cursor-pointer
                          `}
                          aria-label={`Inspect ${rule.title}`}
                        >
                          <ArrowRight className="w-5 h-5 stroke-[2.5] transition-transform duration-300 group-hover:translate-x-0.5" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}