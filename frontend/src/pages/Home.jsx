import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import ReportForm from "../components/ReportForm";
import AnalysisResult from "../components/AnalysisResult";
import { useTheme } from "../context/ThemeContext";
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ClipboardList,
  Target,
  TriangleAlert,
  Network,
  TrendingUp,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Ellipsis,
  ShieldCheck,
  ShieldAlert,
  BrainCircuit,
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Scale,
  BookOpen,
  ArrowRight,
  Layers,
  Search,
  Sliders,
  Radio,
  Building2,
  Info,
  ShieldOff,
} from "lucide-react";
import { analyzeReport, getDashboardAnalytics } from "../services/api";

// 6-Month SIF Risk Trend Data (Matches sif-sentinel-seven.vercel.app)
const TREND_DATA = [
  { month: "Dec", count: 42, critical: 4 },
  { month: "Jan", count: 48, critical: 5 },
  { month: "Feb", count: 58, critical: 6 },
  { month: "Mar", count: 64, critical: 7 },
  { month: "Apr", count: 76, critical: 8 },
  { month: "May", count: 94, critical: 11 },
];

// Hazard Distribution Data
const HAZARD_DISTRIBUTION = [
  { name: "Working at Height", value: 28, color: "#2563eb", count: 96 },
  { name: "Mobile Equipment", value: 23, color: "#06b6d4", count: 79 },
  { name: "Energy Isolation / LOTO", value: 18, color: "#4338ca", count: 62 },
  { name: "Confined Space", value: 14, color: "#f59e0b", count: 48 },
  { name: "Suspended Loads", value: 10, color: "#e11d48", count: 34 },
  { name: "Electrical Hazards", value: 7, color: "#64748b", count: 23 },
];

// Priority SIF Alerts (Matches sif-sentinel-seven.vercel.app)
const PRIORITY_ALERTS = [
  {
    id: "alert-1",
    severity: "CRITICAL",
    badgeClass: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30",
    title: "Worker exposure beneath suspended load",
    site: "Duliajan Drilling Site",
    timeAgo: "12 mins ago",
    riskScore: 94,
    narrative: "Crane hoist line swung 3.5-ton drill pipe casing directly over two riggers without taglines or barrier exclusion tape.",
  },
  {
    id: "alert-2",
    severity: "HIGH",
    badgeClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30",
    title: "Energy isolation procedure potentially bypassed",
    site: "Digboi Refinery",
    timeAgo: "38 mins ago",
    riskScore: 89,
    narrative: "Maintenance tech opened 480V pump electrical switchgear box without applying personal padlock or multi-lock hasp.",
  },
  {
    id: "alert-3",
    severity: "HIGH",
    badgeClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30",
    title: "Repeated near-miss pattern involving mobile equipment",
    site: "Guwahati Terminal",
    timeAgo: "1 hr ago",
    riskScore: 85,
    narrative: "Forklift backed out of loading bay without audible backup beeper, narrowly missing pedestrian pathway.",
  },
];

// 9 IOGP Life-Saving Rules
const IOGP_RULES = [
  { id: "energy-isolation", name: "Energy Isolation", icon: "⚡", category: "Process Safety", severity: "CRITICAL", directive: "Verify isolation and zero energy state before work begins.", example: "Worker worked on live motor without LOTO." },
  { id: "confined-space", name: "Confined Space", icon: "🛢️", category: "Process Safety", severity: "CRITICAL", directive: "Obtain authorization, verify atmospheric testing, confirm rescue plan.", example: "Entered crude separator tank without 4-gas test." },
  { id: "working-at-height", name: "Working at Height", icon: "🪜", category: "Work Environment", severity: "HIGH", directive: "Use 100% fall protection equipment when working above 1.8m.", example: "Rigger unhooked harness lanyard at 8m height." },
  { id: "line-of-fire", name: "Line of Fire", icon: "🏗️", category: "Mechanical & Lifting", severity: "CRITICAL", directive: "Keep out of the path of suspended loads and moving machinery.", example: "Mobile crane swung load across active pathway." },
  { id: "bypassing-controls", name: "Bypassing Controls", icon: "🛡️", category: "Process Safety", severity: "HIGH", directive: "Obtain authorization before overriding safety critical equipment.", example: "Jumpered high pressure trip sensor on compressor." },
  { id: "safe-mechanical-lifting", name: "Safe Mechanical Lifting", icon: "⚙️", category: "Mechanical & Lifting", severity: "HIGH", directive: "Plan lifting operations, verify rigging certification.", example: "Damaged wire rope sling used for 3.2-ton lift." },
  { id: "hot-work", name: "Hot Work", icon: "🔥", category: "Process Safety", severity: "HIGH", directive: "Control ignition sources in hydrocarbon atmospheres.", example: "Grinding near open sampling drain without blanket." },
  { id: "work-authorization", name: "Work Authorization", icon: "📋", category: "Work Environment", severity: "MEDIUM", directive: "Work with a valid permit and conduct pre-job JSA.", example: "Flange unbolted prior to permit signoff." },
  { id: "toxic-gas", name: "Toxic Gas Exposure", icon: "☣️", category: "Process Safety", severity: "CRITICAL", directive: "Wear personal calibrated gas detectors in breathing zones.", example: "Entered flare area without portable H2S monitor." },
];

export default function Home() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'analyze' | 'intelligence' | 'patterns' | 'knowledge'
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [prefilledText, setPrefilledText] = useState(PRIORITY_ALERTS[0].narrative);
  const [selectedRule, setSelectedRule] = useState(IOGP_RULES[0]);

  // SIF Anatomy Simulator
  const [simEnergy, setSimEnergy] = useState("high");
  const [simBarrier, setSimBarrier] = useState("failed");

  const handleScanSubmit = async (payload) => {
    setIsSubmitting(true);
    setError("");
    setResult(null);
    try {
      const data = await analyzeReport(payload);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Backend analysis failed. Verify http://localhost:8000.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInspectAlert = (alert) => {
    setPrefilledText(alert.narrative);
    setActiveTab("analyze");
    const el = document.getElementById("ai-analysis-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="space-y-8">
        {/* 1. Page Heading Banner (Matches sif-sentinel-seven.vercel.app) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mb-1">
              MONITORING CENTER <span className="mx-1">•</span> 01 JUN 2026
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold dark:text-white text-slate-900 tracking-tight">
              Safety Intelligence Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-body">
              AI-powered detection and monitoring of Serious Injury &amp; Fatality precursors.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setActiveTab("analyze");
                const el = document.getElementById("ai-analysis-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-600 hover:from-blue-500 hover:to-indigo-500 shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles size={16} />
              <span>Analyze a report</span>
            </button>
          </div>
        </div>

        {/* 2. 4 Top KPI Cards Grid (Matches sif-sentinel-seven.vercel.app) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Total Safety Reports */}
          <div className="p-5 rounded-2xl dark:bg-[#0e121a] bg-white border dark:border-white/[0.08] border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Total Safety Reports
              </span>
              <span className="w-8 h-8 rounded-xl dark:bg-white/[0.04] bg-slate-100 flex items-center justify-center text-slate-600 dark:text-slate-300">
                <ClipboardList size={16} />
              </span>
            </div>
            <strong className="font-display text-3xl font-extrabold dark:text-white text-slate-900">
              12,486
            </strong>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <TrendingUp size={14} />
              <span>12.8% vs last month</span>
            </div>
          </div>

          {/* Potential SIF Precursors (Blue Accent) */}
          <div className="p-5 rounded-2xl dark:bg-[#0e121a] bg-white border dark:border-blue-500/25 border-blue-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                Potential SIF Precursors
              </span>
              <span className="w-8 h-8 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Target size={16} />
              </span>
            </div>
            <strong className="font-display text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              342
            </strong>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
              <TrendingUp size={14} />
              <span>8.4% detected this month</span>
            </div>
          </div>

          {/* Critical Cases (Red Accent) */}
          <div className="p-5 rounded-2xl dark:bg-[#0e121a] bg-white border dark:border-rose-500/25 border-rose-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                Critical Cases
              </span>
              <span className="w-8 h-8 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <TriangleAlert size={16} />
              </span>
            </div>
            <strong className="font-display text-3xl font-extrabold text-rose-600 dark:text-rose-400">
              27
            </strong>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
              <TrendingUp size={14} />
              <span>3 new in last 24 hours</span>
            </div>
          </div>

          {/* Emerging Risk Patterns (Orange/Amber Accent) */}
          <div className="p-5 rounded-2xl dark:bg-[#0e121a] bg-white border dark:border-amber-500/25 border-amber-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                Emerging Risk Patterns
              </span>
              <span className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Network size={16} />
              </span>
            </div>
            <strong className="font-display text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              08
            </strong>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
              <TrendingUp size={14} />
              <span>2 patterns need review</span>
            </div>
          </div>
        </div>

        {/* 3. Dashboard Charts Row: SIF Risk Trend & Hazard Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trend Area Chart (2 columns) */}
          <div className="lg:col-span-2 p-6 rounded-2xl dark:bg-[#0e121a] bg-white border dark:border-white/[0.08] border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-base font-bold dark:text-white text-slate-900">
                  SIF Risk Trend
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Detected potential precursors by month
                </p>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-white/[0.03] bg-slate-50 text-slate-700 dark:text-slate-300">
                <span>Last 6 months</span>
                <ChevronDown size={13} className="text-slate-400" />
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sifTrendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#ffffff10" : "#0000000d"} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#0f172a" : "#ffffff",
                      borderColor: isDark ? "#334155" : "#cbd5e1",
                      borderRadius: "12px",
                      fontSize: "12px",
                      color: isDark ? "#f8fafc" : "#0f172a",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#sifTrendGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Hazard Donut Distribution (1 column) */}
          <div className="p-6 rounded-2xl dark:bg-[#0e121a] bg-white border dark:border-white/[0.08] border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-base font-bold dark:text-white text-slate-900">
                  Hazard Distribution
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Across all identified precursors
                </p>
              </div>
              <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <Ellipsis size={18} />
              </button>
            </div>

            {/* Donut with Central Number */}
            <div className="relative h-40 flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={HAZARD_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {HAZARD_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <strong className="font-display text-2xl font-extrabold dark:text-white text-slate-900 leading-none">
                  342
                </strong>
                <small className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">
                  SIF risks
                </small>
              </div>
            </div>

            {/* Legend List with Percentages */}
            <ul className="space-y-2 mt-2 text-xs">
              {HAZARD_DISTRIBUTION.map((item) => (
                <li key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="dark:text-slate-300 text-slate-700 truncate font-medium">{item.name}</span>
                  </div>
                  <strong className="font-mono text-xs dark:text-white text-slate-900 shrink-0 ml-2">
                    {item.value}%
                  </strong>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 4. Lower Grid: Priority SIF Alerts & AI Insight Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Priority Alerts List (2 columns) */}
          <div className="lg:col-span-2 p-6 rounded-2xl dark:bg-[#0e121a] bg-white border dark:border-white/[0.08] border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b dark:border-white/[0.06] border-slate-100">
              <div>
                <h2 className="font-display text-base font-bold dark:text-white text-slate-900">
                  Priority SIF Alerts
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Requires attention from your team
                </p>
              </div>
              <Link
                to="/reports"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                View all <ChevronRight size={14} />
              </Link>
            </div>

            <div className="space-y-3">
              {PRIORITY_ALERTS.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => handleInspectAlert(alert)}
                  className="p-4 rounded-xl dark:bg-white/[0.02] bg-slate-50 border dark:border-white/[0.04] border-slate-200 hover:dark:bg-white/[0.05] hover:bg-slate-100/80 transition-all cursor-pointer flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg shrink-0 mt-0.5 ${alert.badgeClass}`}>
                      {alert.severity}
                    </span>
                    <div className="min-w-0">
                      <strong className="text-xs sm:text-sm font-semibold dark:text-white text-slate-900 block truncate group-hover:text-blue-500 transition-colors">
                        {alert.title}
                      </strong>
                      <small className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                        {alert.site} <span className="mx-1">•</span> {alert.timeAgo}
                      </small>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <strong className="font-display text-base font-black text-rose-600 dark:text-rose-400 block leading-tight">
                        {alert.riskScore}
                      </strong>
                      <small className="text-[9px] font-mono text-slate-400 font-semibold">RISK SCORE</small>
                    </div>
                    <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insight Card (1 column) */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/20 via-indigo-950/30 to-purple-950/20 dark:from-blue-950/40 dark:via-indigo-950/60 dark:to-purple-950/40 border border-blue-500/30 shadow-md flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Sparkles size={15} />
                  </span>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/30">
                    AI INSIGHT
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  96% confidence
                </span>
              </div>

              <h3 className="font-display font-bold text-base dark:text-white text-slate-900 mb-2">
                Mobile equipment exposure is accelerating
              </h3>
              <p className="text-xs dark:text-slate-300 text-slate-700 leading-relaxed font-body">
                AI detected a <strong className="text-blue-600 dark:text-blue-400 font-bold">34% increase</strong> in near-miss reports involving mobile equipment in the last 30 days across Guwahati Terminal.
              </p>
            </div>

            <div className="pt-3 border-t border-blue-500/20 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold">
                <TrendingUp size={14} />
                <span>Emerging signal</span>
              </div>
              <button
                onClick={() => {
                  setPrefilledText("Forklift and heavy transport vehicle near-misses clustered around Guwahati Terminal loading bays.");
                  setActiveTab("analyze");
                  const el = document.getElementById("ai-analysis-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                Explore pattern <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* 5. Real-Time AI Analysis Section */}
        <section id="ai-analysis-section" className="pt-8 border-t dark:border-white/[0.08] border-slate-200">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-mono uppercase tracking-wider mb-2 font-bold">
                <BrainCircuit size={14} />
                AI Inference Engine
              </div>
              <h2 className="font-display text-2xl font-bold dark:text-white text-slate-900">
                Real-Time Incident Triage &amp; Barrier Diagnosis
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <ReportForm
              onSubmit={handleScanSubmit}
              isSubmitting={isSubmitting}
              initialText={prefilledText}
            />

            <div>
              {error && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs font-mono mb-4 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-rose-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {result ? (
                <AnalysisResult result={result} />
              ) : (
                <div className="p-12 rounded-2xl dark:bg-[#0e121a] bg-white border border-dashed dark:border-white/10 border-slate-300 text-center flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
                    <Radio size={24} className="animate-pulse" />
                  </div>
                  <h4 className="font-display text-base font-bold dark:text-white text-slate-900">
                    Awaiting Safety Narrative
                  </h4>
                  <p className="text-xs dark:text-slate-400 text-slate-600 max-w-sm mt-1 leading-relaxed">
                    Type a report on the left or select any priority alert above to run instant NLP classification.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 6. SIF Precursor Equation & Anatomy Decision Matrix */}
        <section id="sif-intelligence" className="p-6 sm:p-8 rounded-2xl dark:bg-[#0e121a] bg-white border dark:border-white/[0.08] border-slate-200 shadow-sm space-y-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-mono uppercase tracking-wider mb-2 font-bold">
              <Scale size={13} />
              SIF Precursor Decision Matrix
            </div>
            <h2 className="font-display text-2xl font-bold dark:text-white text-slate-900">
              The SIF Precursor Anatomy Calculator
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Evaluates whether High-Energy hazards and defective critical barriers align to create a fatal exposure.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => setSimEnergy(simEnergy === "high" ? "low" : "high")}
              className={`p-4 rounded-xl border text-left transition-all ${
                simEnergy === "high"
                  ? "bg-rose-500/10 border-rose-500/40 text-rose-600 dark:text-rose-300"
                  : "dark:bg-white/[0.02] bg-slate-50 border-slate-200 text-slate-600 dark:text-slate-400"
              }`}
            >
              <span className="text-[10px] font-mono uppercase font-bold block mb-1">Energy Vector</span>
              <strong className="text-sm block">{simEnergy === "high" ? "⚡ High Energy Active (>480V / >1.8m)" : "🧹 Low Energy Routine"}</strong>
              <small className="text-[11px] text-slate-400">Click to toggle</small>
            </button>

            <button
              onClick={() => setSimBarrier(simBarrier === "failed" ? "intact" : "failed")}
              className={`p-4 rounded-xl border text-left transition-all ${
                simBarrier === "failed"
                  ? "bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-300"
                  : "dark:bg-white/[0.02] bg-slate-50 border-slate-200 text-slate-600 dark:text-slate-400"
              }`}
            >
              <span className="text-[10px] font-mono uppercase font-bold block mb-1">Critical Barrier State</span>
              <strong className="text-sm block">{simBarrier === "failed" ? "🛡️ Missing / Bypassed / Defective" : "✅ 100% Intact & Effective"}</strong>
              <small className="text-[11px] text-slate-400">Click to toggle</small>
            </button>

            <div className={`p-4 rounded-xl border flex flex-col justify-between ${
              simEnergy === "high" && simBarrier === "failed"
                ? "bg-rose-500/15 border-rose-500 text-rose-600 dark:text-rose-300 shadow-sm"
                : "bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-300 shadow-sm"
            }`}>
              <span className="text-[10px] font-mono uppercase font-bold block">Determination</span>
              <strong className="text-base font-black">
                {simEnergy === "high" && simBarrier === "failed" ? "🚨 SIF PRECURSOR ALERT" : "✅ ROUTINE SAFE OBSERVATION"}
              </strong>
              <small className="text-[11px] opacity-80">
                {simEnergy === "high" && simBarrier === "failed" ? "High fatality probability" : "Controlled baseline"}
              </small>
            </div>
          </div>
        </section>

        {/* 7. 9 IOGP Life-Saving Rules Framework */}
        <section id="knowledge-base" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold dark:text-white text-slate-900">
                9 IOGP Life-Saving Rules Standards
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Standardized life-saving controls mapped to every frontline incident report.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {IOGP_RULES.map((rule) => (
              <div
                key={rule.id}
                onClick={() => {
                  setPrefilledText(rule.example);
                  setActiveTab("analyze");
                  const el = document.getElementById("ai-analysis-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="p-4 rounded-2xl dark:bg-[#0e121a] bg-white border dark:border-white/[0.08] border-slate-200 hover:border-blue-500/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-2xl">{rule.icon}</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    {rule.category}
                  </span>
                </div>
                <h4 className="font-display text-sm font-bold dark:text-white text-slate-900 group-hover:text-blue-500 transition-colors mb-1">
                  {rule.name}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-body line-clamp-2">
                  {rule.directive}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 8. Pattern Detection & Emerging Cluster Intelligence */}
        <section id="pattern-detection" className="p-6 sm:p-8 rounded-2xl dark:bg-[#0e121a] bg-white border dark:border-white/[0.08] border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-mono uppercase tracking-wider mb-2 font-bold">
                <Network size={13} />
                Emerging Risk Signals
              </div>
              <h2 className="font-display text-2xl font-bold dark:text-white text-slate-900">
                AI Pattern &amp; Cluster Detection
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Automated NLP grouping of recurring near-miss signals and barrier failures across facilities.
              </p>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/30 animate-pulse">
              8 CLUSTERS IDENTIFIED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "Mobile Equipment Proximity",
                site: "Guwahati Terminal",
                rate: "+34%",
                badge: "CRITICAL",
                color: "rose",
                rule: "Line of Fire",
                desc: "Forklifts and heavy tankers crossing unbarricaded pedestrian pathways in loading bays.",
              },
              {
                title: "H2S Sour Gas Exposures",
                site: "Digboi Flare Area",
                rate: "+22%",
                badge: "HIGH",
                color: "amber",
                rule: "Toxic Gas Exposure",
                desc: "Repeated entries without personal 4-gas bump-tested monitors during venting cycles.",
              },
              {
                title: "Crane Dropped Load Line",
                site: "Duliajan Rig Site",
                rate: "+18%",
                badge: "CRITICAL",
                color: "rose",
                rule: "Safe Mechanical Lifting",
                desc: "Heavy casing pipes hoisted without guide taglines over active work zones.",
              },
              {
                title: "Electrical Breaker LOTO",
                site: "Motor Room B",
                rate: "+15%",
                badge: "HIGH",
                color: "amber",
                rule: "Energy Isolation",
                desc: "Routine motor maintenance begun before verifying zero voltage with calibrated meter.",
              },
            ].map((cluster, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setPrefilledText(`${cluster.title} observed at ${cluster.site}. ${cluster.desc}`);
                  setActiveTab("analyze");
                  const el = document.getElementById("ai-analysis-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="p-4 rounded-xl dark:bg-white/[0.02] bg-slate-50 border dark:border-white/[0.04] border-slate-200 hover:border-blue-500/40 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400">
                      {cluster.badge}
                    </span>
                    <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                      {cluster.rate}
                    </span>
                  </div>
                  <strong className="text-xs sm:text-sm font-bold dark:text-white text-slate-900 block group-hover:text-blue-500 transition-colors mb-1">
                    {cluster.title}
                  </strong>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-2 font-medium">
                    {cluster.site} · {cluster.rule}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {cluster.desc}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t dark:border-white/5 border-slate-200 flex items-center justify-between text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                  <span>Audit in AI Scanner</span>
                  <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 9. Platform Configuration & Settings */}
        <section id="settings" className="p-6 sm:p-8 rounded-2xl dark:bg-[#0e121a] bg-white border dark:border-white/[0.08] border-slate-200 shadow-sm space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-mono uppercase tracking-wider mb-2 font-bold">
              <Sliders size={13} />
              Platform Settings
            </div>
            <h2 className="font-display text-2xl font-bold dark:text-white text-slate-900">
              Model Thresholds &amp; Intelligence Config
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl dark:bg-white/[0.02] bg-slate-50 border dark:border-white/[0.04] border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold dark:text-white text-slate-900">SIF Binary Probability Threshold</span>
                <span className="font-mono text-xs font-bold text-blue-600">0.50 (Calibrated)</span>
              </div>
              <input type="range" min="0.3" max="0.8" step="0.05" defaultValue="0.5" className="w-full accent-blue-600" />
              <p className="text-[11px] text-slate-500">Reports with model confidence exceeding this value are classified as SIF Precursors.</p>
            </div>

            <div className="p-4 rounded-xl dark:bg-white/[0.02] bg-slate-50 border dark:border-white/[0.04] border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold dark:text-white text-slate-900">Automated Barrier Defeat Extraction</span>
                <span className="text-xs font-bold text-emerald-600">ENABLED</span>
              </div>
              <p className="text-[11px] text-slate-500">Extracts compromised physical controls (LOTO, Fall Harness, 4-Gas Test) from free-text.</p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
