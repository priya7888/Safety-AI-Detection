import React, { useState } from 'react';
import {
  FileText,
  Cpu,
  ShieldAlert,
  SearchCode,
  Network,
  BarChart2,
  ArrowDown,
  Workflow,
} from 'lucide-react';

// =====================================================
// SIX SEPARATE IMAGES
// Make sure these files are inside:
// src/assets/
// =====================================================

import i1 from '../assets/i1.jpg';
import i2 from '../assets/i2.jpg';
import i3 from '../assets/i3.jpg';
import i4 from '../assets/i4.jpg';
import i5 from '../assets/i5.jpg';
import i6 from '../assets/i6.jpg';


// =====================================================
// HOW IT WORKS SECTION
// =====================================================

const HowItWorksSection = () => {

  // Currently selected step
  const [selectedStep, setSelectedStep] = useState(0);


  // =====================================================
  // SIX STEPS
  // EACH STEP HAS ITS OWN IMAGE
  // =====================================================

  const steps = [
    {
      id: 1,
      name: 'Safety Reports Ingestion',
      subtitle: 'Data Aggregation',
      icon: FileText,
      color: 'from-blue-500 to-cyan-500',
      image: i1,
      description:
        'Ingests Unsafe Acts (UA), Unsafe Conditions (UC), Near-Misses, and incident logs from OIL platforms and field apps.',
      metric: 'Real-Time Ingestion',
    },

    {
      id: 2,
      name: 'AI / NLP Semantic Engine',
      subtitle: 'Transformer NLP',
      icon: Cpu,
      color: 'from-indigo-500 to-blue-600',
      image: i2,
      description:
        'Domain-trained safety LLMs parse unstructured oilfield jargon, acronyms, and multilingual report descriptions.',
      metric: '< 500ms Triage',
    },

    {
      id: 3,
      name: 'SIF Precursor Detection',
      subtitle: 'Fatal Potential Classifier',
      icon: ShieldAlert,
      color: 'from-amber-500 to-yellow-600',
      image: i3,
      description:
        'Differentiates true fatal precursors from low-energy occurrences using scientific EEI/DEKRA risk models.',
      metric: '98.4% Precision',
    },

    {
      id: 4,
      name: 'Barrier Failure Mapping',
      subtitle: 'Bow-Tie Defense',
      icon: SearchCode,
      color: 'from-yellow-500 to-amber-600',
      image: i4,
      description:
        'Identifies whether physical LOTO, administrative permits, or interlock hardware defenses were compromised.',
      metric: '100% Barrier Audit',
    },

    {
      id: 5,
      name: 'Pattern & Trend Analytics',
      subtitle: 'Risk Clustering',
      icon: Network,
      color: 'from-purple-500 to-indigo-600',
      image: i5,
      description:
        'Aggregates recurring precursor clusters across rigs, production platforms, gathering stations, and pipeline zones.',
      metric: 'Site SPDI Index',
    },

    {
      id: 6,
      name: 'Automated HSSE Alerts',
      subtitle: 'Action Command Center',
      icon: BarChart2,
      color: 'from-red-500 to-orange-500',
      image: i6,
      description:
        'Triggers automated Stop Work Authority recommendations and targeted audit stand-downs for safety leaders.',
      metric: 'Zero Data Lag',
    },
  ];


  // =====================================================
  // CURRENT STEP
  // =====================================================

  const currentStep = steps[selectedStep];


  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-[#070709] py-24 text-white md:py-32"
    >

      {/* =================================================
          BACKGROUND GLOW
      ================================================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

        <div className="absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />

      </div>


      {/* =================================================
          MAIN CONTAINER
      ================================================= */}

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">

        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-2 lg:gap-20">


          {/* =================================================
              LEFT SIDE
              HOW IT WORKS + FLOWCHART
          ================================================= */}

          <div className="w-full">

            {/* HEADING */}

            <div className="mb-10">

              <div className="inline-flex items-center gap-2.5 rounded-xl border-2 border-amber-400 bg-amber-500/20 px-5 py-2.5 text-sm font-black uppercase tracking-wider text-amber-300 shadow-md">

                <Workflow className="h-5 w-5 text-amber-400" />

                <span>How It Works</span>

              </div>

            </div>


            {/* =================================================
                FLOWCHART
            ================================================= */}

            <div className="relative">

              {steps.map((step, index) => {

                const Icon = step.icon;

                const isSelected = selectedStep === index;


                return (
                  <React.Fragment key={step.id}>

                    {/* =================================================
                        STEP NODE
                    ================================================= */}

                    <button
                      type="button"
                      onClick={() => setSelectedStep(index)}
                      className={`group relative flex w-full items-center rounded-2xl border p-4 text-left transition-all duration-300 sm:p-5 ${isSelected
                        ? 'border-amber-400 bg-amber-400/10 shadow-[0_0_30px_rgba(245,158,11,0.12)]'
                        : 'border-white/10 bg-white/[0.03] hover:border-amber-400/40 hover:bg-white/[0.06]'
                        }`}
                    >

                      {/* STEP NUMBER */}

                      <div
                        className={`mr-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br font-black transition-all duration-300 ${step.color} ${isSelected
                          ? 'scale-110 shadow-lg'
                          : 'opacity-80 group-hover:opacity-100'
                          }`}
                      >
                        <span className="text-lg text-white">
                          {step.id}
                        </span>
                      </div>


                      {/* STEP ICON */}

                      <div
                        className={`mr-4 hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 sm:flex ${isSelected
                          ? 'border-amber-400/50 bg-amber-400/10 text-amber-300'
                          : 'border-white/10 bg-white/5 text-slate-400 group-hover:text-white'
                          }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>


                      {/* STEP TITLE */}

                      <div className="min-w-0 flex-1">

                        <h3
                          className={`text-base font-bold transition-colors duration-300 sm:text-lg ${isSelected
                            ? 'text-amber-300'
                            : 'text-white group-hover:text-amber-200'
                            }`}
                        >
                          {step.name}
                        </h3>


                        <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500 sm:text-sm">
                          {step.subtitle}
                        </p>

                      </div>


                      {/* ACTIVE DOT */}

                      <div
                        className={`ml-3 h-3 w-3 shrink-0 rounded-full transition-all duration-300 ${isSelected
                          ? 'scale-125 bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]'
                          : 'bg-white/10'
                          }`}
                      />

                    </button>


                    {/* =================================================
                        ARROW BETWEEN STEPS
                    ================================================= */}

                    {index < steps.length - 1 && (

                      <div className="flex h-10 justify-center">

                        <div className="flex flex-col items-center">

                          {/* CONNECTING LINE */}

                          <div
                            className={`h-5 w-px transition-all duration-300 ${selectedStep > index
                              ? 'bg-amber-400'
                              : 'bg-white/15'
                              }`}
                          />


                          {/* ARROW */}

                          <ArrowDown
                            className={`h-5 w-5 transition-all duration-300 ${selectedStep > index
                              ? 'text-amber-400'
                              : 'text-white/20'
                              }`}
                          />

                        </div>

                      </div>

                    )}

                  </React.Fragment>
                );

              })}

            </div>

          </div>


          {/* =================================================
              RIGHT SIDE
              PLAIN IMAGE + DESCRIPTION
          ================================================= */}

          <div className="flex w-full flex-col items-center lg:pt-10">


            {/* =================================================
                PLAIN IMAGE
            ================================================= */}

            <div className="w-full max-w-xl">

              <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">

                <img
                  key={currentStep.id}
                  src={currentStep.image}
                  alt={currentStep.name}
                  className="h-[360px] w-full object-cover animate-image-change sm:h-[420px]"
                />

              </div>

            </div>


            {/* =================================================
                DESCRIPTION CARD
            ================================================= */}

            <div className="mt-8 w-full max-w-xl rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm sm:p-7">


              {/* STAGE + METRIC */}

              <div className="mb-4 flex items-center justify-between gap-4">

                <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                  Stage 0{currentStep.id}
                </span>


                <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
                  {currentStep.metric}
                </span>

              </div>


              {/* TITLE */}

              <h3 className="text-2xl font-black text-white sm:text-3xl">
                {currentStep.name}
              </h3>


              {/* SUBTITLE */}

              <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
                {currentStep.subtitle}
              </p>


              {/* DESCRIPTION */}

              <p className="mt-5 text-base leading-7 text-slate-300">
                {currentStep.description}
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          IMAGE ANIMATION
      ================================================= */}

      <style>{`

        @keyframes imageChange {

          0% {
            opacity: 0;
            transform: scale(1.06);
          }

          100% {
            opacity: 1;
            transform: scale(1);
          }

        }

        .animate-image-change {
          animation: imageChange 0.6s ease-out;
        }

      `}</style>

    </section>
  );
};


export default HowItWorksSection;