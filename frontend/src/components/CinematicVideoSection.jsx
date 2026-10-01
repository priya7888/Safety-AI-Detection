import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

// =====================================================
// SIF INTELLIGENCE IMAGES
// Images are stored inside:
// src/assets/
// =====================================================

import sif1 from '../assets/sif1.jpg';
import sif2 from '../assets/sif2.jpg';
import sif3 from '../assets/sif3.jpg';
import sif4 from '../assets/sif4.jpg';
import sif5 from '../assets/sif5.jpg';
import sif6 from '../assets/sif6.jpg';


// =====================================================
// SIF INTELLIGENCE SECTION
// =====================================================

export default function CinematicVideoSection({
  onLogin,
  onSeeHowItWorks
}) {

  // =====================================================
  // IMAGE LIST
  // =====================================================

  const images = [
    sif1,
    sif2,
    sif3,
    sif4,
    sif5,
    sif6,
  ];


  // =====================================================
  // IMAGE ORDER
  // The first image is always the front image
  // =====================================================

  const [imageOrder, setImageOrder] = useState(
    images.map((_, index) => index)
  );


  // =====================================================
  // ANIMATION STATE
  // =====================================================

  const [isMoving, setIsMoving] = useState(false);


  // =====================================================
  // MOVE FRONT IMAGE TO BACK
  // =====================================================

  const moveToNextImage = () => {

    // Prevent multiple clicks during animation
    if (isMoving) return;

    setIsMoving(true);

    // Wait for the front-card animation to finish
    setTimeout(() => {

      setImageOrder((currentOrder) => [

        // Move first image to the end
        ...currentOrder.slice(1),

        currentOrder[0],

      ]);

      setIsMoving(false);

    }, 600);
  };


  // =====================================================
  // AUTOMATIC IMAGE CHANGE
  // Changes every 5 seconds
  // =====================================================

  useEffect(() => {

    const interval = setInterval(() => {

      moveToNextImage();

    }, 3000);

    return () => clearInterval(interval);

  }, [isMoving]);


  // =====================================================
  // RETURN
  // =====================================================

  return (

    <section
      id="sif-intelligence"
      className="relative overflow-hidden bg-[#FAF8F5] py-24 text-slate-900 transition-colors duration-300 md:py-32"
    >

      {/* =================================================
          BACKGROUND DECORATION
      ================================================= */}

      <div className="pointer-events-none absolute inset-0">

        <div
          className="
            absolute
            -left-40
            top-20
            h-96
            w-96
            rounded-full
            bg-amber-200/20
            blur-3xl
          "
        />

        <div
          className="
            absolute
            -right-40
            bottom-20
            h-96
            w-96
            rounded-full
            bg-yellow-200/20
            blur-3xl
          "
        />

      </div>


      {/* =================================================
          MAIN CONTAINER
      ================================================= */}

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div
          className="
            grid
            grid-cols-1
            items-center
            gap-16
            lg:grid-cols-12
            lg:gap-0
          "
        >


          {/* =================================================
              LEFT SIDE
              STACKED IMAGE CAROUSEL
          ================================================= */}

          <div className="lg:col-span-6 lg:pr-14">

            <div
              className="
                relative
                mx-auto
                h-[430px]
                w-full
                max-w-md
                sm:h-[480px]
                lg:max-w-none
              "
            >


              {/* =================================================
                  STACKED IMAGES
              ================================================= */}

              {imageOrder.map((imageIndex, stackIndex) => {

                const isFront = stackIndex === 0;

                return (

                  <div
                    key={imageIndex}
                    onClick={
                      isFront
                        ? moveToNextImage
                        : undefined
                    }
                    className={`
                      absolute
                      inset-0
                      overflow-hidden
                      rounded-3xl
                      border
                      border-slate-200
                      bg-white
                      shadow-2xl
                      transition-all
                      duration-700
                      ease-in-out
                      ${isFront
                        ? 'cursor-pointer'
                        : ''
                      }
                    `}
                    style={{

                      // =================================================
                      // STACK ORDER
                      // =================================================

                      zIndex:
                        images.length - stackIndex,


                      // =================================================
                      // POSITION + ROTATION
                      // =================================================

                      transform:

                        // FRONT IMAGE
                        stackIndex === 0

                          ? isMoving

                            ? `
                              translateX(-110%)
                              rotate(-8deg)
                              scale(0.92)
                            `

                            : `
                              translateX(0)
                              rotate(0deg)
                              scale(1)
                            `

                          // BACK IMAGES
                          : `
                            translateX(-${stackIndex * 12}px)
                            translateY(${stackIndex * 12}px)
                            rotate(-${stackIndex * 2}deg)
                            scale(${1 - stackIndex * 0.035})
                          `,


                      // =================================================
                      // OPACITY
                      // =================================================

                      opacity:
                        stackIndex > 3
                          ? 0
                          : 1 - stackIndex * 0.12,

                    }}
                  >


                    {/* =================================================
                        IMAGE
                    ================================================= */}

                    <img
                      src={images[imageIndex]}
                      alt={`SIF Intelligence ${imageIndex + 1}`}
                      className="
                        h-full
                        w-full
                        object-cover
                      "
                    />


                    {/* =================================================
                        IMAGE GRADIENT
                    ================================================= */}

                    <div
                      className="
                        pointer-events-none
                        absolute
                        inset-0
                        bg-gradient-to-t
                        from-black/50
                        via-transparent
                        to-transparent
                      "
                    />


                    {/* =================================================
                        FRONT IMAGE CONTENT
                    ================================================= */}

                    {isFront && (

                      <div
                        className="
                          absolute
                          bottom-5
                          left-5
                          right-5
                          flex
                          items-center
                          justify-between
                        "
                      >


                        {/* IMAGE LABEL */}

                        <div
                          className="
                            rounded-xl
                            bg-black/60
                            px-4
                            py-2
                            backdrop-blur-md
                          "
                        >

                          <p
                            className="
                              text-xs
                              font-bold
                              uppercase
                              tracking-widest
                              text-amber-300
                            "
                          >
                            SIF Intelligence
                          </p>

                          <p
                            className="
                              mt-1
                              text-sm
                              font-semibold
                              text-white
                            "
                          >
                            Safety Signal Analysis
                          </p>

                        </div>


                        {/* NEXT BUTTON */}

                        <button
                          type="button"
                          onClick={(event) => {

                            event.stopPropagation();

                            moveToNextImage();

                          }}
                          className="
                            flex
                            h-11
                            w-11
                            items-center
                            justify-center
                            rounded-full
                            bg-amber-400
                            text-slate-950
                            shadow-lg
                            transition-transform
                            duration-300
                            hover:scale-110
                          "
                          aria-label="Show next SIF image"
                        >

                          <ArrowRight className="h-5 w-5" />

                        </button>

                      </div>

                    )}

                  </div>

                );

              })}

            </div>

          </div>


          {/* =================================================
              RIGHT SIDE
              SIF INTELLIGENCE CONTENT
          ================================================= */}

          <div
            className="
              space-y-6
              text-left
              lg:col-span-6
              lg:pl-14
            "
          >


            {/* =================================================
                SECTION TAG
            ================================================= */}

            <div
              className="
                inline-flex
                items-center
                gap-2.5
                rounded-xl
                border-2
                border-amber-400
                bg-amber-100/95
                px-5
                py-2.5
                text-sm
                font-black
                uppercase
                tracking-wider
                text-amber-950
                shadow-md
              "
            >

              <Sparkles
                className="
                  h-5
                  w-5
                  text-amber-600
                "
              />

              <span>
                SIF Intelligence
              </span>

            </div>


            {/* =================================================
                MAIN HEADING
            ================================================= */}

            <h3
              className="
                font-heading
                text-3xl
                font-bold
                leading-tight
                tracking-tight
                text-slate-900
                sm:text-4xl
                md:text-5xl
              "
            >
              Detect Hidden Safety Signals Before Incidents
            </h3>


            {/* =================================================
                PROMINENT METRIC
            ================================================= */}

            <div
              className="
                flex
                items-baseline
                gap-3
                pt-1
              "
            >

              <span
                className="
                  font-heading
                  text-4xl
                  font-black
                  text-amber-600
                  sm:text-5xl
                "
              >
                100%
              </span>

              <span
                className="
                  text-xs
                  font-medium
                  text-slate-600
                  sm:text-sm
                "
              >
                Continuous Digital Barrier Assurance
              </span>

            </div>


            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <p
              className="
                text-base
                font-normal
                leading-relaxed
                text-slate-700
                sm:text-lg
              "
            >
              High-energy hazards (pressure, voltage, gravity,
              toxic gases) are analyzed instantly from field logs
              to protect teams during high-risk workover and
              refinery turnaround tasks.
            </p>


            {/* =================================================
                FEATURES
            ================================================= */}

            <div className="space-y-3 pt-2">


              {/* =================================================
                  FEATURE 1
              ================================================= */}

              <div className="flex items-start gap-3">

                <div
                  className="
                    mt-1
                    shrink-0
                    rounded-full
                    bg-amber-100
                    p-1
                    text-amber-700
                  "
                >

                  <CheckCircle2 className="h-3.5 w-3.5" />

                </div>

                <span
                  className="
                    text-sm
                    font-semibold
                    text-slate-800
                  "
                >
                  Live SIF Parsing: Instant energy vector &amp;
                  hazard identification
                </span>

              </div>


              {/* =================================================
                  FEATURE 2
              ================================================= */}

              <div className="flex items-start gap-3">

                <div
                  className="
                    mt-1
                    shrink-0
                    rounded-full
                    bg-amber-100
                    p-1
                    text-amber-700
                  "
                >

                  <CheckCircle2 className="h-3.5 w-3.5" />

                </div>

                <span
                  className="
                    text-sm
                    font-semibold
                    text-slate-800
                  "
                >
                  IOGP Guardrails: Standardized life-saving
                  rules compliance
                </span>

              </div>


              {/* =================================================
                  FEATURE 3
              ================================================= */}

              <div className="flex items-start gap-3">

                <div
                  className="
                    mt-1
                    shrink-0
                    rounded-full
                    bg-amber-100
                    p-1
                    text-amber-700
                  "
                >

                  <CheckCircle2 className="h-3.5 w-3.5" />

                </div>

                <span
                  className="
                    text-sm
                    font-semibold
                    text-slate-800
                  "
                >
                  Zero Data Lag: Eliminates quarterly review
                  backlogs completely
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>

  );
}