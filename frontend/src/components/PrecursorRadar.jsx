import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Radio,
  ExternalLink,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  Activity,
  Gauge,
  Volume2,
  VolumeX,
  Crosshair,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const RADAR_PRECURSORS = [
  {
    id: "precursor-1",
    tag: "Precursor #1",
    rule: "Energy Isolation",
    severity: "hazard",
    sif: true,
    confidence: "94%",
    title: "Vulnerability #1",
    report_text: "Worker performed maintenance without isolating electrical energy in Motor Room B.",
    barrier: "Energy Isolation / LOTO Missing",
    dotColor: "bg-rose-500",
    dotRing: "ring-rose-500/40",
    positionClass: "top-1/4 -left-4 sm:left-4 md:-left-12 lg:-left-20",
    coordinates: "Azimuth 300° · 85m",
    rangeMeter: 85,
  },
  {
    id: "precursor-2",
    tag: "Precursor #2",
    rule: "Confined Space",
    severity: "hazard",
    sif: true,
    confidence: "92%",
    title: "Vulnerability #2",
    report_text: "Contractor entered separator vessel without preliminary atmospheric gas testing.",
    barrier: "Atmospheric Gas Testing Missing",
    dotColor: "bg-amber-400",
    dotRing: "ring-amber-400/40",
    positionClass: "top-1/2 -left-2 sm:left-8 md:-left-6 lg:left-0",
    coordinates: "Azimuth 250° · 120m",
    rangeMeter: 120,
  },
  {
    id: "precursor-3",
    tag: "Precursor #3",
    rule: "Housekeeping",
    severity: "safe",
    sif: false,
    confidence: "88%",
    title: "Observation #3",
    report_text: "Liquid spill observed in main corridor; routine mop and sign posted.",
    barrier: "Routine Maintenance",
    dotColor: "bg-emerald-400",
    dotRing: "ring-emerald-400/40",
    positionClass: "bottom-16 -left-4 sm:left-6 md:-left-8 lg:-left-16",
    coordinates: "Azimuth 210° · 45m",
    rangeMeter: 45,
  },
  {
    id: "precursor-4",
    tag: "Precursor #4",
    rule: "Line of Fire",
    severity: "hazard",
    sif: true,
    confidence: "96%",
    title: "Vulnerability #4",
    report_text: "Crane operator swung 4-ton steel girder directly over active personnel walkway.",
    barrier: "Exclusion Zone Missing",
    dotColor: "bg-rose-500",
    dotRing: "ring-rose-500/50",
    positionClass: "top-1/3 -right-4 sm:right-4 md:-right-12 lg:-right-20",
    coordinates: "Azimuth 045° · 160m",
    rangeMeter: 160,
  },
  {
    id: "precursor-5",
    tag: "Precursor #5",
    rule: "Working at Height",
    severity: "hazard",
    sif: true,
    confidence: "91%",
    title: "Vulnerability #5",
    report_text: "Subcontractor working on scaffolding at 6m without clipping safety harness.",
    barrier: "100% Fall Protection Missing",
    dotColor: "bg-amber-400",
    dotRing: "ring-yellow-400/40",
    positionClass: "bottom-24 right-0 sm:right-8 md:-right-4 lg:right-6",
    coordinates: "Azimuth 110° · 95m",
    rangeMeter: 95,
  },
  {
    id: "precursor-6",
    tag: "Observation #6",
    rule: "Facility Routine",
    severity: "safe",
    sif: false,
    confidence: "94%",
    title: "Observation #6",
    report_text: "Minor label fading on secondary eyewash station bottle; replaced from stock.",
    barrier: "Routine Housekeeping",
    dotColor: "bg-emerald-400",
    dotRing: "ring-emerald-400/40",
    positionClass: "bottom-4 -right-2 sm:right-10 md:right-4 lg:-right-12",
    coordinates: "Azimuth 150° · 30m",
    rangeMeter: 30,
  },
];

export default function PrecursorRadar({ onSelectPrecursor }) {
  const [activeItem, setActiveItem] = useState(null);
  const [filter, setFilter] = useState("all");
  const [scanSpeed, setScanSpeed] = useState("normal");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [rangeFilter, setRangeFilter] = useState(250);
  const [mouseCoords, setMouseCoords] = useState(null);
  const radarRef = useRef(null);
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const playSonarPing = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
      console.log("Audio not allowed", e);
    }
  };

  const handleInspect = (item) => {
    setActiveItem(item);
    playSonarPing();
    if (onSelectPrecursor) {
      onSelectPrecursor(item);
    }
  };

  const handleTestInEngine = (item) => {
    navigate("/analyze", { state: { prefill: item.report_text } });
  };

  const handleMouseMove = (e) => {
    if (!radarRef.current) return;
    const rect = radarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const dist = Math.round(Math.sqrt(x * x + y * y) * 0.7);
    let angle = Math.round((Math.atan2(y, x) * 180) / Math.PI + 90);
    if (angle < 0) angle += 360;
    setMouseCoords({ azimuth: angle, range: dist });
  };

  const handleMouseLeave = () => {
    setMouseCoords(null);
  };

  const filteredPrecursors = RADAR_PRECURSORS.filter((p) => {
    if (filter === "sif" && !p.sif) return false;
    if (filter === "safe" && p.sif) return false;
    if (p.rangeMeter > rangeFilter) return false;
    return true;
  });

  return (
    <section className="relative pt-6 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-rose-500/[0.08] via-purple-500/[0.05] to-cyan-500/[0.04] blur-[150px] rounded-full pointer-events-none" />

      {/* Hero Headline and Intro */}
      <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-500 dark:text-rose-400 text-xs font-mono uppercase tracking-widest mb-6 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          Continuous AI Precursor Radar Engine
        </div>

        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight dark:text-white text-slate-900 leading-[1.12] mb-6">
          Tuneable, end-to-end{" "}
          <span className="gradient-heading-rose">precursor scanning.</span>
        </h1>

        <p className="text-base sm:text-lg dark:text-slate-300/90 text-slate-600 leading-relaxed max-w-2xl mx-auto mb-8 font-body">
          Detect Serious Injury & Fatality (SIF) precursor exposures in real time. Map incident narratives to IOGP Life-Saving Rules and pinpoint barrier failures before incidents occur.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/analyze"
            className="px-7 py-3.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-rose-500 via-rose-600 to-crimson-600 hover:from-rose-400 hover:to-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.45)] hover:shadow-[0_0_45px_rgba(244,63,94,0.7)] hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles size={16} />
            Start AI Scanner
          </Link>

          <Link
            to="/dashboard"
            className="px-7 py-3.5 rounded-full text-sm font-medium dark:text-slate-200 text-slate-700 dark:bg-white/[0.04] bg-white hover:bg-slate-50 dark:hover:bg-white/[0.09] border dark:border-white/10 border-slate-200/90 shadow-sm backdrop-blur-xl transition-all flex items-center gap-2 hover:-translate-y-0.5 cursor-pointer"
          >
            <Activity size={16} className="text-rose-500" />
            Explore Live Dashboard
            <ArrowUpRight size={15} />
          </Link>
        </div>

        {/* Interactive Radar Control Panel (Filter + Range + Speed + Audio) */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-8">
          {/* Target Filter Switch */}
          <div className="inline-flex items-center gap-1.5 p-1 rounded-xl dark:bg-dark-900/80 bg-white/90 border dark:border-white/10 border-slate-200 shadow-sm backdrop-blur-md">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                filter === "all"
                  ? "dark:bg-white/10 bg-slate-900 text-white font-semibold"
                  : "dark:text-slate-400 text-slate-600 dark:hover:text-slate-200 hover:text-slate-900"
              }`}
            >
              All ({filteredPrecursors.length})
            </button>
            <button
              onClick={() => setFilter("sif")}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1 cursor-pointer ${
                filter === "sif"
                  ? "bg-rose-500/20 text-rose-500 dark:text-rose-300 font-semibold border border-rose-500/30"
                  : "dark:text-slate-400 text-slate-600 hover:text-rose-500"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              SIF Precursors
            </button>
            <button
              onClick={() => setFilter("safe")}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1 cursor-pointer ${
                filter === "safe"
                  ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-semibold border border-emerald-500/30"
                  : "dark:text-slate-400 text-slate-600 hover:text-emerald-600"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Routine Safe
            </button>
          </div>

          {/* Facility Radius Selector */}
          <div className="inline-flex items-center gap-1 p-1 rounded-xl dark:bg-dark-900/80 bg-white/90 border dark:border-white/10 border-slate-200 shadow-sm backdrop-blur-md text-xs font-mono">
            <button
              onClick={() => setRangeFilter(50)}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                rangeFilter === 50
                  ? "dark:bg-white/10 bg-slate-900 text-white font-semibold"
                  : "dark:text-slate-400 text-slate-600"
              }`}
            >
              50m
            </button>
            <button
              onClick={() => setRangeFilter(100)}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                rangeFilter === 100
                  ? "dark:bg-white/10 bg-slate-900 text-white font-semibold"
                  : "dark:text-slate-400 text-slate-600"
              }`}
            >
              100m
            </button>
            <button
              onClick={() => setRangeFilter(250)}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                rangeFilter === 250
                  ? "dark:bg-white/10 bg-slate-900 text-white font-semibold"
                  : "dark:text-slate-400 text-slate-600"
              }`}
            >
              250m All
            </button>
          </div>

          {/* Speed & Audio Toggles */}
          <div className="inline-flex items-center gap-1 p-1 rounded-xl dark:bg-dark-900/80 bg-white/90 border dark:border-white/10 border-slate-200 shadow-sm backdrop-blur-md">
            <button
              onClick={() => setScanSpeed(scanSpeed === "normal" ? "fast" : "normal")}
              className="px-2.5 py-1 rounded-lg text-xs font-mono dark:text-slate-300 text-slate-700 hover:text-rose-500 flex items-center gap-1 cursor-pointer transition-colors"
              title="Toggle Radar Sweep Speed"
            >
              <Gauge size={13} className="text-rose-500" />
              <span>{scanSpeed === "fast" ? "2x Turbo" : "1x Normal"}</span>
            </button>

            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playSonarPing();
              }}
              className={`p-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                soundEnabled ? "text-rose-500 dark:bg-rose-500/20 bg-rose-50" : "dark:text-slate-400 text-slate-500"
              }`}
              title={soundEnabled ? "Sonar Audio: ON (Click to mute)" : "Sonar Audio: OFF (Click to unmute)"}
            >
              {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* Center Radar Scanner Display with Mouse Tracker */}
      <div
        ref={radarRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full max-w-[860px] h-[540px] sm:h-[620px] md:h-[660px] mx-auto my-4 flex items-center justify-center cursor-crosshair select-none"
      >
        {/* Live Coordinate HUD Pin (when hovering over radar) */}
        {mouseCoords && (
          <div className="absolute top-2 right-4 z-40 px-3 py-1.5 rounded-xl dark:bg-dark-900/90 bg-white/95 border dark:border-white/15 border-slate-200 shadow-lg font-mono text-[11px] flex items-center gap-2 text-rose-500 pointer-events-none animate-in fade-in duration-150">
            <Crosshair size={13} className="animate-spin" style={{ animationDuration: "6s" }} />
            <span>AZ {String(mouseCoords.azimuth).padStart(3, "0")}° · R {mouseCoords.range}m</span>
          </div>
        )}

        {/* Concentric Radar Circles with degrees */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Ring 4 (Outermost - 250m) */}
          <div className="w-[500px] h-[500px] sm:w-[580px] sm:h-[580px] md:w-[640px] md:h-[640px] rounded-full border dark:border-rose-500/15 border-rose-500/25 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-mono dark:text-rose-400/50 text-rose-600/70 dark:bg-dark-950 bg-white px-1 rounded shadow-xs">000° N (250m)</span>
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[9px] font-mono dark:text-rose-400/50 text-rose-600/70 dark:bg-dark-950 bg-white px-1 rounded shadow-xs">180° S</span>
            <span className="absolute top-1/2 -left-3 -translate-y-1/2 text-[9px] font-mono dark:text-rose-400/50 text-rose-600/70 dark:bg-dark-950 bg-white px-1 rounded shadow-xs">270° W</span>
            <span className="absolute top-1/2 -right-3 -translate-y-1/2 text-[9px] font-mono dark:text-rose-400/50 text-rose-600/70 dark:bg-dark-950 bg-white px-1 rounded shadow-xs">090° E</span>
          </div>

          {/* Ring 3 (150m) */}
          <div className="w-[380px] h-[380px] sm:w-[440px] sm:h-[440px] md:w-[480px] md:h-[480px] rounded-full border dark:border-rose-500/20 border-rose-500/30" />

          {/* Ring 2 (100m) */}
          <div className="w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] md:w-[320px] md:h-[320px] rounded-full border dark:border-rose-500/30 border-rose-500/40 border-dashed" />

          {/* Ring 1 (Inner - 50m) */}
          <div className="w-[130px] h-[130px] sm:w-[150px] sm:h-[150px] rounded-full border dark:border-rose-500/40 border-rose-500/50" />

          {/* Crosshairs */}
          <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-rose-500/25 to-transparent" />
          <div className="absolute h-full w-[1px] bg-gradient-to-b from-transparent via-rose-500/25 to-transparent" />
          
          {/* Diagonal Guides */}
          <div className="absolute w-3/4 h-[1px] bg-gradient-to-r from-transparent via-rose-500/10 to-transparent rotate-45" />
          <div className="absolute w-3/4 h-[1px] bg-gradient-to-r from-transparent via-rose-500/10 to-transparent -rotate-45" />
        </div>

        {/* Rotating Radar Sweep Beam */}
        <div className="absolute w-[460px] h-[460px] sm:w-[540px] sm:h-[540px] md:w-[600px] md:h-[600px] rounded-full overflow-hidden pointer-events-none flex items-center justify-center">
          <div className={`w-full h-full rounded-full ${isDark ? "radar-beam" : "radar-beam-light"} ${scanSpeed === "fast" ? "animate-radar-sweep-fast" : "animate-radar-sweep"} origin-center`} />
        </div>

        {/* Center Beacon Core Hub */}
        <div className="relative z-20 flex flex-col items-center justify-center">
          <div
            onClick={playSonarPing}
            className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full dark:bg-dark-900 bg-white border-2 border-rose-500 flex items-center justify-center shadow-[0_0_40px_rgba(244,63,94,0.6)] group cursor-pointer active:scale-95 transition-transform"
            title="Click to ping sonar beacon"
          >
            <div className="absolute inset-1.5 rounded-full bg-gradient-to-br from-rose-500/40 to-crimson-600/20 animate-pulse" />
            <div className="relative z-10 w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500">
              <Radio size={22} className="text-rose-500 animate-spin" style={{ animationDuration: "14s" }} />
            </div>
            {/* Pulsing ripples */}
            <div className="absolute -inset-4 rounded-full border border-rose-500/40 animate-ping pointer-events-none opacity-35" />
          </div>
          <span className="mt-2 text-[10px] font-mono uppercase tracking-widest text-rose-500 dark:text-rose-400 dark:bg-dark-950/95 bg-white/95 px-2.5 py-0.5 rounded-full border border-rose-500/40 shadow-sm font-semibold">
            AI RADAR ACTIVE
          </span>
        </div>

        {/* Floating Precursor Callout Cards */}
        {filteredPrecursors.map((item) => {
          const isSelected = activeItem?.id === item.id;

          return (
            <div
              key={item.id}
              onClick={() => handleInspect(item)}
              className={`absolute z-30 transition-all duration-300 cursor-pointer ${item.positionClass} max-w-[210px] sm:max-w-[240px]`}
            >
              <div
                className={`p-3 rounded-2xl backdrop-blur-2xl border transition-all text-left shadow-xl ${
                  isSelected
                    ? "dark:bg-dark-850/98 bg-white border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.4)] scale-105"
                    : "dark:bg-dark-900/85 bg-white/90 hover:dark:bg-dark-850/95 hover:bg-white dark:border-white/10 border-slate-200 hover:border-rose-500/50 hover:shadow-[0_0_20px_rgba(244,63,94,0.2)] hover:scale-[1.02]"
                }`}
              >
                {/* Header with dot and Review tag */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.dotColor} ring-4 ${item.dotRing} shrink-0 animate-pulse`} />
                    <span className="text-[12px] font-semibold dark:text-white text-slate-900 truncate font-display">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-rose-500 flex items-center gap-0.5 shrink-0 bg-rose-500/10 px-1.5 py-0.5 rounded font-medium">
                    Inspect <ChevronRight size={10} />
                  </span>
                </div>

                {/* Report snippet */}
                <p className="text-[11px] dark:text-slate-300 text-slate-600 line-clamp-2 leading-relaxed mb-2 font-body">
                  {item.report_text}
                </p>

                {/* SIF Status & Coordinates Tag */}
                <div className="flex items-center justify-between pt-2 border-t dark:border-white/5 border-slate-100 text-[10px]">
                  <span
                    className={`font-mono font-semibold px-2 py-0.5 rounded-md ${
                      item.sif
                        ? "bg-rose-500/15 text-rose-500 dark:text-rose-400 border border-rose-500/30"
                        : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    {item.sif ? `SIF: YES (${item.confidence})` : `NON-SIF (${item.confidence})`}
                  </span>
                  <span className="dark:text-slate-400 text-slate-500 font-mono text-[10px] truncate max-w-[85px]">
                    {item.coordinates}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Precursor Detail Drawer / HUD */}
      {activeItem && (
        <div className="max-w-2xl mx-auto mt-4 p-5 rounded-2xl dark:bg-dark-850/95 bg-white border border-rose-500/50 backdrop-blur-2xl shadow-cyber-glow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className={`p-2.5 rounded-xl shrink-0 ${activeItem.sif ? "bg-rose-500/20 text-rose-500 border border-rose-500/30" : "bg-emerald-500/20 text-emerald-600 border border-emerald-500/30"}`}>
              {activeItem.sif ? <AlertTriangle size={22} /> : <CheckCircle2 size={22} />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono uppercase dark:text-slate-400 text-slate-500 font-semibold">{activeItem.title}</span>
                <span className="text-xs font-mono font-semibold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  {activeItem.rule}
                </span>
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">{activeItem.confidence} Confidence</span>
              </div>
              <p className="text-sm dark:text-white text-slate-900 mt-1 leading-snug font-medium">{activeItem.report_text}</p>
              <p className="text-xs font-mono dark:text-slate-400 text-slate-500 mt-1">Barrier: <span className="text-rose-500 font-semibold">{activeItem.barrier}</span> · <span className="text-slate-400">{activeItem.coordinates}</span></p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
            <button
              onClick={() => handleTestInEngine(activeItem)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-crimson-600 hover:from-rose-400 hover:to-rose-500 transition-all flex items-center gap-1.5 shadow-cyber-glow-sm cursor-pointer"
            >
              <Sparkles size={13} />
              Analyze in Live AI <ExternalLink size={12} />
            </button>
            <button
              onClick={() => setActiveItem(null)}
              className="px-3 py-2 rounded-xl text-xs font-medium dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900 dark:hover:bg-white/5 hover:bg-slate-100 transition-colors border dark:border-white/5 border-slate-200 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
