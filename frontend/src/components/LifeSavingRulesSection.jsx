import React, { useState } from 'react';
import {
  Zap,
  DoorClosed,
  Flame,
  Crosshair,
  ArrowUpRight,
  Anchor,
  ShieldCheck,
  AlertTriangle,
  X,
  CheckCircle2
} from 'lucide-react';

export default function LifeSavingRulesSection() {
  const [selectedRule, setSelectedRule] = useState(null);

  const rules = [
    {
      id: 'energy-isolation',
      title: 'Energy Isolation',
      icon: Zap,
      code: 'LSR-01',
      vectorTag: '⚡ High Pressure & Electrical',

      iconBg: 'from-amber-400 to-amber-600',

      cardBg:
        'bg-gradient-to-br from-[#18130B]/95 via-[#101017] to-[#0B0B10]',

      borderColor:
        'border-amber-500/30 hover:border-amber-400',

      shadowColor:
        'hover:shadow-[0_12px_35px_rgba(245,158,11,0.22)]',

      accentText: 'text-amber-400',

      accentBg:
        'bg-amber-500/10 border-amber-500/30 text-amber-300 group-hover:bg-amber-500/20 group-hover:border-amber-400',

      flareBg: 'bg-amber-500/20',

      btnBg:
        'bg-amber-500/15 group-hover:bg-amber-400 group-hover:text-slate-950 text-amber-400',

      shortDescription:
        'Verify isolation and zero energy state before starting work on electrical, mechanical, or pressure systems.',

      energyHazard:
        'High Pressure (>150 PSI), Electrical (>50V), Hydraulic',

      criticalBarriers: [
        'Lockout / Tagout (LOTO) padlocks applied',
        'Physical depressurization tested with calibrated gauge',
        'Formal isolation certificate signed by HSE supervisor'
      ],

      nlpKeywords: [
        'loto',
        'isolation',
        'lockout',
        'breaker',
        'pressurized line'
      ]
    },

    {
      id: 'confined-space',
      title: 'Confined Space',
      icon: DoorClosed,
      code: 'LSR-02',
      vectorTag: '💨 Toxic H2S & O2 Depletion',

      iconBg: 'from-cyan-400 to-blue-600',

      cardBg:
        'bg-gradient-to-br from-[#0B151F]/95 via-[#101017] to-[#0B0B10]',

      borderColor:
        'border-cyan-500/30 hover:border-cyan-400',

      shadowColor:
        'hover:shadow-[0_12px_35px_rgba(6,182,212,0.22)]',

      accentText: 'text-cyan-400',

      accentBg:
        'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 group-hover:bg-cyan-500/20 group-hover:border-cyan-400',

      flareBg: 'bg-cyan-500/20',

      btnBg:
        'bg-cyan-500/15 group-hover:bg-cyan-400 group-hover:text-slate-950 text-cyan-400',

      shortDescription:
        'Obtain authorization, verify atmospheric testing, and ensure rescue stand-by before entering enclosed spaces.',

      energyHazard:
        'Asphyxiation (O2 < 19.5%), Toxic H2S Gas (>10 PPM)',

      criticalBarriers: [
        'Calibrated 4-gas test before entry',
        'Continuous forced mechanical air ventilation',
        'Dedicated standby rescue crew equipped with SCBA'
      ],

      nlpKeywords: [
        'confined space',
        'tank entry',
        'gas test',
        'h2s',
        'oxygen deficiency'
      ]
    },

    {
      id: 'hot-work',
      title: 'Hot Work',
      icon: Flame,
      code: 'LSR-03',
      vectorTag: '🔥 Flash Fire & Ignition',

      iconBg: 'from-orange-500 to-red-600',

      cardBg:
        'bg-gradient-to-br from-[#1C0F0A]/95 via-[#101017] to-[#0B0B10]',

      borderColor:
        'border-orange-500/30 hover:border-orange-400',

      shadowColor:
        'hover:shadow-[0_12px_35px_rgba(249,115,22,0.22)]',

      accentText: 'text-orange-400',

      accentBg:
        'bg-orange-500/10 border-orange-500/30 text-orange-300 group-hover:bg-orange-500/20 group-hover:border-orange-400',

      flareBg: 'bg-orange-500/20',

      btnBg:
        'bg-orange-500/15 group-hover:bg-orange-400 group-hover:text-slate-950 text-orange-400',

      shortDescription:
        'Control ignition sources and verify continuous gas monitoring prior to welding or open-flame jobs.',

      energyHazard:
        'Hydrocarbon Gas Flash Fire, Explosion',

      criticalBarriers: [
        'Hot work permit with LEL < 1% verification',
        'Pressurized fire hose and certified fire watch assigned',
        'Flame-retardant welding habitat deployed'
      ],

      nlpKeywords: [
        'hot work',
        'welding',
        'spark',
        'cutting torch',
        'lel test'
      ]
    },

    {
      // =====================================================
      // 4TH RULE - LINE OF FIRE
      // NEW ROSE / RED COLOR THEME
      // =====================================================

      id: 'line-of-fire',
      title: 'Line of Fire',
      icon: Crosshair,
      code: 'LSR-04',
      vectorTag: '🎯 Kinetic Impact & Crush',

      iconBg: 'from-rose-400 to-pink-600',

      cardBg:
        'bg-gradient-to-br from-[#1C0A12]/95 via-[#101017] to-[#0B0B10]',

      borderColor:
        'border-rose-500/30 hover:border-rose-400',

      shadowColor:
        'hover:shadow-[0_12px_35px_rgba(244,63,94,0.25)]',

      accentText: 'text-rose-400',

      accentBg:
        'bg-rose-500/10 border-rose-500/30 text-rose-300 group-hover:bg-rose-500/20 group-hover:border-rose-400',

      flareBg: 'bg-rose-500/20',

      btnBg:
        'bg-rose-500/15 group-hover:bg-rose-400 group-hover:text-slate-950 text-rose-400',

      shortDescription:
        'Position yourself outside trajectory zones of moving equipment, pressurized release, and suspended loads.',

      energyHazard:
        'Kinetic Impact (>10 kJ), Stored Spring Energy',

      criticalBarriers: [
        'Exclusion zone red-tape physically installed',
        'Secondary retention lines & whip-checks installed',
        'Active machine proximity sensors verified'
      ],

      nlpKeywords: [
        'line of fire',
        'pinch point',
        'crush hazard',
        'whip check'
      ]
    },

    {
      id: 'working-at-height',
      title: 'Working at Height',
      icon: Anchor,
      code: 'LSR-05',
      vectorTag: '⚓ Gravitational Fall Risk',

      iconBg: 'from-indigo-400 to-purple-600',

      cardBg:
        'bg-gradient-to-br from-[#130E1F]/95 via-[#101017] to-[#0B0B10]',

      borderColor:
        'border-indigo-500/30 hover:border-indigo-400',

      shadowColor:
        'hover:shadow-[0_12px_35px_rgba(99,102,241,0.22)]',

      accentText: 'text-indigo-400',

      accentBg:
        'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 group-hover:bg-indigo-500/20 group-hover:border-indigo-400',

      flareBg: 'bg-indigo-500/20',

      btnBg:
        'bg-indigo-500/15 group-hover:bg-indigo-400 group-hover:text-slate-950 text-indigo-400',

      shortDescription:
        'Protect against falls by inspecting harnesses, verifying 100% tie-off, and securing scaffold green tags.',

      energyHazard:
        'Gravitational Fall Potential (>1.8m Elevation)',

      criticalBarriers: [
        '100% double-lanyard tie-off to load-rated anchor points',
        'Daily scaffold green-tag inspection verified',
        'Tool tethers and secondary debris netting installed'
      ],

      nlpKeywords: [
        'working at height',
        'fall arrest',
        'scaffold green tag',
        'harness'
      ]
    },

    {
      id: 'bypass-safety-controls',
      title: 'Bypassing Controls',
      icon: ShieldCheck,
      code: 'LSR-06',
      vectorTag: '🛡️ Safety Critical Defeat',

      iconBg: 'from-emerald-400 to-teal-600',

      cardBg:
        'bg-gradient-to-br from-[#0B1A14]/95 via-[#101017] to-[#0B0B10]',

      borderColor:
        'border-emerald-500/30 hover:border-emerald-400',

      shadowColor:
        'hover:shadow-[0_12px_35px_rgba(16,185,129,0.22)]',

      accentText: 'text-emerald-400',

      accentBg:
        'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 group-hover:bg-emerald-500/20 group-hover:border-emerald-400',

      flareBg: 'bg-emerald-500/20',

      btnBg:
        'bg-emerald-500/15 group-hover:bg-emerald-400 group-hover:text-slate-950 text-emerald-400',

      shortDescription:
        'Obtain formal management authorization before overriding or isolating any safety-critical ESD device.',

      energyHazard:
        'Loss of Primary Containment (LOPC), Overpressure',

      criticalBarriers: [
        'Formal Safety Critical Element override permit signed',
        'Compensatory manual mitigation active in control room',
        'Time-limited override with automated expiration alert'
      ],

      nlpKeywords: [
        'bypass',
        'safety override',
        'esd defeat',
        'interlock disabled'
      ]
    }
  ];

  return (
    <section
      id="life-saving-rules"
      className="
        py-24
        md:py-32
        bg-[#070709]
        text-white
        relative
        transition-colors
        duration-300
        overflow-hidden
      "
    >

      {/* =====================================================
          BACKGROUND SOFT GLOW
      ===================================================== */}

      <div
        className="
          absolute
          top-1/4
          left-10
          w-[500px]
          h-[500px]
          bg-amber-500/10
          rounded-full
          blur-3xl
          pointer-events-none
        "
      />

      <div
        className="
          absolute
          bottom-10
          right-10
          w-[500px]
          h-[500px]
          bg-amber-500/5
          rounded-full
          blur-3xl
          pointer-events-none
        "
      />

      <div
        className="
          max-w-[1400px]
          mx-auto
          px-4
          sm:px-6
          lg:px-10
          relative
          z-10
        "
      >

        {/* =====================================================
            TOP HEADER & HIGHLIGHTS - FULL WIDTH
        ===================================================== */}
        <div className="text-center max-w-4xl mx-auto space-y-4 mb-12">

          {/* SECTION TAG */}
          <div
            className="
              inline-flex
              items-center
              gap-2.5
              px-4
              py-2
              rounded-full
              bg-amber-500/15
              border
              border-amber-400/40
              text-amber-300
              text-xs
              sm:text-sm
              font-bold
              uppercase
              tracking-wider
              backdrop-blur-md
              shadow-sm
              shadow-amber-500/10
            "
          >
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>IOGP Standard Guardrails • 6 Rules</span>
          </div>

          {/* HEADING */}
          <h2
            className="
              text-3xl
              sm:text-4xl
              md:text-5xl
              font-extrabold
              text-white
              font-heading
              leading-tight
              tracking-tight
            "
          >
            Standardized Defense Against{' '}
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
              Fatal Trajectories
            </span>
          </h2>

          {/* SUBTITLE */}
          <p
            className="
              text-base
              sm:text-lg
              text-slate-300
              max-w-3xl
              mx-auto
              leading-relaxed
              font-normal
            "
          >
            Our AI engine automatically maps free-text field reports and near-misses against standardized IOGP Life-Saving Rules to detect critical barrier failures and high-energy vectors in real-time.
          </p>

          {/* HIGHLIGHT CHIPS */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] hover:border-amber-500/30 transition-colors text-xs font-medium text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Zero-Energy State &amp; LOTO Isolation</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] hover:border-cyan-500/30 transition-colors text-xs font-medium text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Atmospheric &amp; Continuous Gas Checks</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] hover:border-rose-500/30 transition-colors text-xs font-medium text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>100% Tie-Off &amp; Line of Fire Barriers</span>
            </div>
          </div>

        </div>

        {/* =====================================================
            SIX BOXES GRID - SPREAD NEATLY (3-COLUMN ON DESKTOP)
        ===================================================== */}
        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            gap-6
            lg:gap-7
            w-full
          "
        >
          {rules.map((rule) => {
            const Icon = rule.icon;

            return (
              <div
                key={rule.id}
                onClick={() => setSelectedRule(rule)}
                className={`
                  group
                  relative
                  ${rule.cardBg}
                  rounded-2xl
                  p-6
                  sm:p-7
                  border
                  ${rule.borderColor}
                  shadow-xl
                  ${rule.shadowColor}
                  transition-all
                  duration-300
                  hover:-translate-y-2
                  hover:scale-[1.015]
                  cursor-pointer
                  flex
                  flex-col
                  justify-between
                  overflow-hidden
                  min-h-[300px]
                `}
              >
                {/* AMBIENT HOVER FLARE */}
                <div
                  className={`
                    absolute
                    -top-12
                    -right-12
                    w-48
                    h-48
                    ${rule.flareBg}
                    rounded-full
                    blur-2xl
                    opacity-0
                    group-hover:opacity-100
                    transition-opacity
                    duration-500
                    pointer-events-none
                  `}
                />

                {/* SHIMMER EFFECT */}
                <div
                  className="
                    absolute
                    inset-0
                    -translate-x-full
                    group-hover:translate-x-full
                    transition-transform
                    duration-1000
                    bg-gradient-to-r
                    from-transparent
                    via-white/[0.07]
                    to-transparent
                    pointer-events-none
                  "
                />

                {/* CARD CONTENT */}
                <div className="relative z-10">
                  {/* TOP ROW */}
                  <div className="flex items-center justify-between mb-5">
                    {/* ICON */}
                    <div
                      className={`
                        w-13
                        h-13
                        p-3
                        rounded-xl
                        bg-gradient-to-br
                        ${rule.iconBg}
                        text-slate-950
                        flex
                        items-center
                        justify-center
                        shadow-md
                        group-hover:rotate-6
                        group-hover:scale-110
                        transition-all
                        duration-300
                      `}
                    >
                      <Icon className="w-6 h-6 stroke-[2.5]" />
                    </div>

                    {/* CODE */}
                    <span
                      className={`
                        flex
                        items-center
                        gap-1.5
                        px-3
                        py-1
                        rounded-full
                        text-xs
                        font-mono
                        font-bold
                        border
                        transition-all
                        ${rule.accentBg}
                      `}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      {rule.code}
                    </span>
                  </div>

                  {/* TITLE */}
                  <h3
                    className="
                      text-xl
                      font-bold
                      font-heading
                      text-white
                      mb-2.5
                      group-hover:text-white
                      transition-colors
                    "
                  >
                    {rule.title}
                  </h3>

                  {/* DESCRIPTION */}
                  <p
                    className="
                      text-xs
                      sm:text-[13px]
                      text-slate-300/90
                      leading-relaxed
                      mb-4
                      group-hover:text-slate-100
                      transition-colors
                      min-h-[38px]
                    "
                  >
                    {rule.shortDescription}
                  </p>

                  {/* ENERGY VECTOR */}
                  <div
                    className="
                      inline-flex
                      items-center
                      px-3
                      py-1
                      rounded-lg
                      bg-white/[0.04]
                      border
                      border-white/[0.08]
                      text-xs
                      font-mono
                      text-slate-300
                      mb-2
                    "
                  >
                    {rule.vectorTag}
                  </div>
                </div>

                {/* BOTTOM ROW */}
                <div
                  className="
                    relative
                    z-10
                    pt-4
                    mt-4
                    border-t
                    border-white/[0.08]
                    flex
                    items-center
                    justify-between
                    text-xs
                    font-bold
                    font-mono
                    transition-colors
                  "
                >
                  <span
                    className={`
                      ${rule.accentText}
                      group-hover:tracking-wide
                      transition-all
                    `}
                  >
                    Inspect Barrier
                  </span>

                  <div
                    className={`
                      w-8
                      h-8
                      rounded-lg
                      ${rule.btnBg}
                      flex
                      items-center
                      justify-center
                      transition-all
                      duration-300
                      shadow-sm
                    `}
                  >
                    <ArrowUpRight
                      className="
                        w-4
                        h-4
                        group-hover:translate-x-0.5
                        group-hover:-translate-y-0.5
                        transition-transform
                      "
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM HELPER / STATUS */}
        <div
          className="
            mt-10
            text-xs
            text-slate-400
            font-mono
            flex
            items-center
            justify-center
            gap-2
          "
        >
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>
            Hover or click any card to inspect barrier defense rules, energy hazards &amp; bow-tie triggers
          </span>
        </div>

        {/* =====================================================
            RULE DRILLDOWN MODAL
        ===================================================== */}
        {selectedRule && (
          <div
            className="
              fixed
              inset-0
              z-50
              flex
              items-center
              justify-center
              p-4
              sm:p-6
              bg-black/80
              backdrop-blur-sm
              animate-in
              fade-in
              duration-200
            "
            onClick={() => setSelectedRule(null)}
          >

            <div
              onClick={(e) => e.stopPropagation()}
              className="
                bg-[#0F0F16]
                border
                border-amber-500/30
                max-w-xl
                w-full
                rounded-2xl
                p-6
                sm:p-8
                shadow-2xl
                shadow-amber-500/10
                space-y-6
                relative
                max-h-[90vh]
                overflow-y-auto
                animate-in
                fade-in
                zoom-in-95
                lg:slide-in-from-right-8
                duration-300
              "
            >

              {/* CLOSE BUTTON */}

              <button
                onClick={() => setSelectedRule(null)}
                className="
                  absolute
                  top-5
                  right-5
                  p-1.5
                  rounded-lg
                  text-slate-400
                  hover:text-white
                  hover:bg-white/10
                  transition-colors
                  cursor-pointer
                "
              >
                <X className="w-5 h-5" />
              </button>


              {/* MODAL HEADER */}

              <div className="flex items-center gap-4">

                <div
                  className={`
                    w-12
                    h-12
                    rounded-xl
                    bg-gradient-to-br
                    ${selectedRule.iconBg}
                    text-slate-950
                    flex
                    items-center
                    justify-center
                    shrink-0
                    shadow-lg
                  `}
                >

                  <selectedRule.icon className="w-6 h-6 stroke-[2.5]" />

                </div>

                <div>

                  <span
                    className="
                      text-xs
                      font-mono
                      font-bold
                      text-amber-400
                      uppercase
                      tracking-wider
                    "
                  >
                    {selectedRule.code} Guardrail Standard
                  </span>

                  <h3
                    className="
                      text-2xl
                      font-bold
                      font-heading
                      text-white
                    "
                  >
                    {selectedRule.title}
                  </h3>

                </div>

              </div>


              {/* DESCRIPTION */}

              <p
                className="
                  text-sm
                  text-slate-300
                  leading-relaxed
                "
              >
                {selectedRule.shortDescription}
              </p>


              {/* HAZARD SIGNATURE */}

              <div
                className="
                  p-4
                  rounded-xl
                  bg-amber-500/10
                  border
                  border-amber-500/20
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-amber-400
                    font-bold
                    text-xs
                    uppercase
                    font-mono
                    mb-1.5
                  "
                >

                  <AlertTriangle className="w-4 h-4 text-amber-400" />

                  <span>
                    High-Energy Hazard Signature:
                  </span>

                </div>

                <p
                  className="
                    text-xs
                    sm:text-sm
                    text-slate-200
                    font-medium
                  "
                >
                  {selectedRule.energyHazard}
                </p>

              </div>


              {/* CRITICAL BARRIERS */}

              <div className="space-y-2.5">

                <div
                  className="
                    text-xs
                    font-mono
                    uppercase
                    font-bold
                    text-slate-400
                  "
                >
                  Critical Barriers Monitored by AI:
                </div>

                <div className="space-y-2">

                  {selectedRule.criticalBarriers.map(
                    (cb, idx) => (

                      <div
                        key={idx}
                        className="
                          flex
                          items-start
                          gap-2.5
                          text-xs
                          sm:text-sm
                          text-slate-200
                          p-2
                          rounded-lg
                          bg-white/[0.03]
                          border
                          border-white/[0.04]
                        "
                      >

                        <CheckCircle2
                          className="
                            w-4
                            h-4
                            text-emerald-400
                            shrink-0
                            mt-0.5
                          "
                        />

                        <span>
                          {cb}
                        </span>

                      </div>

                    )
                  )}

                </div>

              </div>


              {/* CLOSE BUTTON */}

              <div className="pt-2 flex justify-end">

                <button
                  onClick={() => setSelectedRule(null)}
                  className="
                    px-6
                    py-2.5
                    rounded-xl
                    bg-amber-400
                    hover:bg-amber-300
                    text-slate-950
                    font-bold
                    text-sm
                    shadow-lg
                    shadow-amber-500/20
                    transition-all
                    cursor-pointer
                  "
                >
                  Close Guardrail
                </button>

              </div>

            </div>

          </div>

        )}

      </div>

    </section>
  );
}