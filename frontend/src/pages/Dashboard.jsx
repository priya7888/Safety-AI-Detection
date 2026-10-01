import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  BrainCircuit,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Eye,
  Calendar,
  MapPin,
  Tag,
  Sparkles,
  ExternalLink,
  MessageSquareCheck,
  X,
  Send,
  SlidersHorizontal,
} from "lucide-react";
import Layout from "../components/Layout";
import SummaryCard from "../components/SummaryCard";
import ChartCard from "../components/ChartCard";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import { getDashboard, submitReview } from "../services/api";
import { useTheme } from "../context/ThemeContext";

// Color Palettes
const REPORT_TYPE_COLORS = {
  "Unsafe Act": "#2563eb", // Navy/Blue
  "Unsafe Condition": "#f59e0b", // Amber/Gold
  "Near Miss": "#06b6d4", // Cyan
  "Near-Miss": "#06b6d4",
  "Observation": "#64748b",
};

const SIF_STATUS_COLORS = {
  YES: "#f59e0b", // Amber/Orange
  NO: "#10b981", // Emerald
  "INSUFFICIENT INFORMATION": "#64748b",
};

const HAZARD_BAR_COLORS = [
  "#3b82f6",
  "#f59e0b",
  "#06b6d4",
  "#8b5cf6",
  "#10b981",
  "#ec4899",
  "#64748b",
  "#f97316",
];

// Custom Chart Tooltip
const CustomChartTooltip = ({ active, payload, label, unit = "" }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-xl dark:bg-[#0b0e17] bg-white border dark:border-slate-700 border-slate-200 shadow-xl text-xs font-mono">
        <p className="font-bold dark:text-white text-slate-900 mb-1">
          {label || payload[0].name}
        </p>
        {payload.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 mt-0.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: item.color || item.fill || "#3b82f6" }}
            />
            <span className="dark:text-slate-400 text-slate-600 font-sans">{item.name || "Count"}:</span>
            <span className="font-bold dark:text-slate-200 text-slate-900">
              {item.value} {unit}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [trendFilter, setTrendFilter] = useState("30"); // "7" | "30" | "all"
  const { isDark } = useTheme();
  const navigate = useNavigate();

  // Review Modal State
  const [reviewingReport, setReviewingReport] = useState(null);
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [agreeWithAI, setAgreeWithAI] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchDashboard = () => {
    setLoading(true);
    getDashboard()
      .then((res) => {
        setData(res);
        setError("");
      })
      .catch((err) => {
        console.error("Dashboard fetch error:", err);
        setError("Could not load dashboard data from backend. Please ensure backend service is running.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Filter trend data based on time filter
  const filteredTrend = useMemo(() => {
    if (!data?.reporting_trend?.length) return [];
    if (trendFilter === "7") return data.reporting_trend.slice(-7);
    if (trendFilter === "30") return data.reporting_trend.slice(-30);
    return data.reporting_trend;
  }, [data, trendFilter]);

  // Handle Review Submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewingReport || !reviewFeedback.trim()) return;

    setSubmittingReview(true);
    try {
      await submitReview(reviewingReport.id, {
        feedback: reviewFeedback.trim(),
        agree_with_ai: agreeWithAI,
      });
      // Refresh dashboard data
      fetchDashboard();
      setReviewingReport(null);
      setReviewFeedback("");
    } catch (err) {
      alert("Failed to submit review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <LoadingState label="Loading Safety Intelligence telemetry..." />
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <EmptyState
          icon={AlertTriangle}
          title="Dashboard Telemetry Unavailable"
          description={error || "Could not retrieve safety reports and AI analysis."}
          action={
            <button
              onClick={fetchDashboard}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow transition-all cursor-pointer"
            >
              Retry Connection
            </button>
          }
        />
      </Layout>
    );
  }

  const isBrandNewOrg = data.total_reports === 0;

  return (
    <Layout
      title="Safety Intelligence Dashboard"
      description="AI-powered analysis of your organization's safety reports."
      action={
        <Link
          to="/analyze"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-sm hover:shadow transition-all cursor-pointer"
        >
          <PlusCircle size={15} />
          <span>+ Submit Safety Report</span>
        </Link>
      }
    >
      <div className="space-y-8">
        {/* ====================================================
            MAIN DASHBOARD HERO SECTION (Clean & Compact)
           ==================================================== */}
        <div className="p-5 sm:p-6 rounded-2xl dark:bg-[#0d121f] bg-white border dark:border-slate-800 border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <p className="text-[11px] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold">
                SafetyAI Platform
              </p>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-extrabold dark:text-white text-slate-900 tracking-tight">
              Safety Intelligence Overview
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Monitor safety reports, AI analysis, and potential SIF precursor findings across your organization.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/analyze"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-sm hover:shadow transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle size={15} />
              <span>+ Submit Safety Report</span>
            </Link>
            <Link
              to="/reports"
              className="px-4 py-2.5 rounded-xl dark:bg-slate-800 bg-slate-100 hover:dark:bg-slate-700 hover:bg-slate-200 border dark:border-slate-700 border-slate-200 text-xs font-semibold dark:text-slate-200 text-slate-700 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <ClipboardList size={15} />
              <span>View Safety Reports</span>
            </Link>
          </div>
        </div>

        {/* ====================================================
            TOP SUMMARY ROW (4 Clean Panels with Real Data)
           ==================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Panel 1: Safety Reports (Blue) */}
          <SummaryCard
            label="Safety Reports"
            value={data.total_reports}
            sublabel="Submitted safety observations"
            accent="blue"
            icon={ClipboardList}
          />

          {/* Panel 2: Analysis Completed (Green) */}
          <SummaryCard
            label="Analysis Completed"
            value={data.completed_analysis}
            sublabel="Reports successfully analyzed"
            accent="green"
            icon={CheckCircle2}
          />

          {/* Panel 3: Potential SIF Findings (Amber/Orange) */}
          <SummaryCard
            label="Potential SIF Findings"
            value={data.potential_sif_findings}
            sublabel="Require safety attention"
            accent="amber"
            icon={AlertTriangle}
          />

          {/* Panel 4: Awaiting Review (Purple) */}
          <SummaryCard
            label="Awaiting Review"
            value={data.awaiting_review}
            sublabel="Awaiting expert review"
            accent="purple"
            icon={BrainCircuit}
          />
        </div>

        {/* ====================================================
            ROW 1 CHARTS: Distribution (Donut) & Trend (Line)
           ==================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Safety Report Distribution */}
          <ChartCard
            title="Safety Report Distribution"
            description="Distribution of submitted safety observations by report type."
            className="h-[380px]"
          >
            {data.report_distribution?.length > 0 ? (
              <div className="relative w-full h-[260px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.report_distribution}
                      dataKey="count"
                      nameKey="report_type"
                      innerRadius={68}
                      outerRadius={98}
                      paddingAngle={4}
                      stroke="rgba(0,0,0,0.08)"
                      strokeWidth={1}
                    >
                      {data.report_distribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={REPORT_TYPE_COLORS[entry.report_type] || HAZARD_BAR_COLORS[index % HAZARD_BAR_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomChartTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(val) => (
                        <span className="text-xs font-medium dark:text-slate-300 text-slate-700 ml-1">
                          {val}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center of Donut: Total Reports */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-9">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    Total
                  </span>
                  <span className="font-display text-2xl font-extrabold dark:text-white text-slate-900 leading-tight">
                    {data.total_reports}
                  </span>
                  <span className="text-[10px] text-slate-400">Reports</span>
                </div>
              </div>
            ) : (
              <div className="h-[260px] flex flex-col items-center justify-center text-center p-6 space-y-3">
                <p className="text-sm font-medium text-slate-400">No safety reports available yet.</p>
                <Link
                  to="/analyze"
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-500 dark:text-blue-400 text-xs font-semibold hover:bg-blue-600/25 transition-all"
                >
                  Submit First Safety Report
                </Link>
              </div>
            )}
          </ChartCard>

          {/* Chart 2: Safety Reporting Trend */}
          <ChartCard
            title="Safety Reporting Trend"
            description="Safety reports submitted over time."
            className="h-[380px]"
            action={
              <div className="flex items-center gap-1 p-1 rounded-xl dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200">
                {["7", "30", "all"].map((val) => (
                  <button
                    key={val}
                    onClick={() => setTrendFilter(val)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                      trendFilter === val
                        ? "bg-blue-600 text-white font-bold shadow-xs"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {val === "all" ? "All Time" : `${val} Days`}
                  </button>
                ))}
              </div>
            }
          >
            {filteredTrend.length > 0 ? (
              <div className="w-full h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredTrend} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: isDark ? "#94a3b8" : "#64748b" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 10, fill: isDark ? "#94a3b8" : "#64748b" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={32}
                      formatter={(val) => (
                        <span className="text-xs font-medium dark:text-slate-300 text-slate-700 ml-1">
                          {val}
                        </span>
                      )}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Total Reports"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: "#2563eb" }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="sif_count"
                      name="SIF Precursors"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "#f59e0b" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[260px] flex flex-col items-center justify-center text-center p-6">
                <p className="text-sm font-medium text-slate-400">Submit safety reports to view reporting trends.</p>
              </div>
            )}
          </ChartCard>
        </div>

        {/* ====================================================
            ROW 2 CHARTS: SIF Assessment & Common Hazards
           ==================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 3: SIF Precursor Assessment */}
          <ChartCard
            title="SIF Precursor Assessment"
            description="AI assessment based on available safety report information."
            className="h-[360px]"
          >
            {data.total_reports > 0 ? (
              <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.sif_assessment_distribution}
                    layout="vertical"
                    margin={{ left: 30, right: 20, top: 15, bottom: 10 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}
                    />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{ fontSize: 10, fill: isDark ? "#94a3b8" : "#64748b" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="status"
                      width={100}
                      tick={{ fontSize: 11, fill: isDark ? "#cbd5e1" : "#334155", fontWeight: 600 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Bar dataKey="count" name="Assessment Count" radius={[0, 8, 8, 0]} barSize={24}>
                      {data.sif_assessment_distribution.map((entry, idx) => (
                        <Cell
                          key={`sif-cell-${idx}`}
                          fill={SIF_STATUS_COLORS[entry.status] || "#3b82f6"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-center p-6">
                <p className="text-sm font-medium text-slate-400">No completed AI analyses available.</p>
              </div>
            )}
          </ChartCard>

          {/* Chart 4: Common Hazards Identified */}
          <ChartCard
            title="Common Hazards Identified"
            description="Hazards detected from completed AI analyses."
            className="h-[360px]"
          >
            {data.common_hazards?.length > 0 ? (
              <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.common_hazards}
                    layout="vertical"
                    margin={{ left: 20, right: 20, top: 10, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}
                    />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{ fontSize: 10, fill: isDark ? "#94a3b8" : "#64748b" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="hazard"
                      width={140}
                      tick={{ fontSize: 11, fill: isDark ? "#cbd5e1" : "#334155" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Bar dataKey="count" name="Identified Count" radius={[0, 8, 8, 0]} barSize={18}>
                      {data.common_hazards.map((_, idx) => (
                        <Cell
                          key={`hazard-cell-${idx}`}
                          fill={HAZARD_BAR_COLORS[idx % HAZARD_BAR_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-center p-6">
                <p className="text-sm font-medium text-slate-400">No hazards have been identified yet.</p>
              </div>
            )}
          </ChartCard>
        </div>

        {/* ====================================================
            ROW 3 CHART: Full-Width Safety Reports by Location
           ==================================================== */}
        <ChartCard
          title="Safety Reports by Location"
          description="Safety observations across operational areas."
          className="h-[340px]"
        >
          {data.reports_by_location?.length > 0 ? (
            <div className="w-full h-[230px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.reports_by_location}
                  margin={{ top: 15, right: 15, left: -10, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}
                  />
                  <XAxis
                    dataKey="location"
                    tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 10, fill: isDark ? "#94a3b8" : "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Bar dataKey="count" name="Report Count" fill="#2563eb" radius={[8, 8, 0, 0]} barSize={36}>
                    {data.reports_by_location.map((_, idx) => (
                      <Cell
                        key={`loc-cell-${idx}`}
                        fill={HAZARD_BAR_COLORS[idx % HAZARD_BAR_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[230px] flex items-center justify-center text-center p-6">
              <p className="text-sm font-medium text-slate-400">No location observations recorded yet.</p>
            </div>
          )}
        </ChartCard>

        {/* ====================================================
            ROW 4: Recent Safety Reports (Real Database Table)
           ==================================================== */}
        <div className="p-6 rounded-2xl dark:bg-[#0d121f] bg-white border dark:border-slate-800 border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b dark:border-slate-800 border-slate-100">
            <div>
              <h3 className="font-display text-base font-bold dark:text-white text-slate-900">
                Recent Safety Reports
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest submitted safety observations for your organization.
              </p>
            </div>

            <Link
              to="/reports"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>View All Reports</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {data.recent_reports?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b dark:border-slate-800 border-slate-200 text-slate-400 font-mono uppercase tracking-wider">
                    <th className="py-2.5 px-3">Report Reference</th>
                    <th className="py-2.5 px-3">Report Type</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">Report Date</th>
                    <th className="py-2.5 px-3">Analysis Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-800/60 divide-slate-100 font-body">
                  {data.recent_reports.map((report) => (
                    <tr
                      key={report.id}
                      className="hover:dark:bg-slate-800/30 hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {report.reference}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                            report.report_type === "Unsafe Act"
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                              : report.report_type === "Unsafe Condition"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              : "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20"
                          }`}
                        >
                          {report.report_type}
                        </span>
                      </td>
                      <td className="py-3 px-3 max-w-xs truncate dark:text-slate-300 text-slate-700">
                        {report.description}
                      </td>
                      <td className="py-3 px-3 dark:text-slate-300 text-slate-700">
                        {report.location || "General Facility"}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-400">
                        {report.report_date || "Recent"}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {report.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          to={`/reports/${report.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500"
                        >
                          <span>View Report</span>
                          <ExternalLink size={12} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400">
              <p>No safety reports submitted yet.</p>
              <Link
                to="/analyze"
                className="mt-2 inline-block text-xs font-semibold text-blue-500 hover:underline"
              >
                Submit Your First Safety Report
              </Link>
            </div>
          )}
        </div>

        {/* ====================================================
            ROW 5: Potential SIF Precursor Findings (Key Section)
           ==================================================== */}
        <div className="p-6 rounded-2xl dark:bg-[#0d121f] bg-white border dark:border-amber-500/30 border-amber-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b dark:border-slate-800 border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h3 className="font-display text-base font-bold dark:text-white text-slate-900">
                  Potential SIF Precursor Findings
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Reports where AI identified a potential SIF precursor based on available information.
              </p>
            </div>

            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
              {data.potential_sif_findings_list?.length || 0} Priority Findings
            </span>
          </div>

          {data.potential_sif_findings_list?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.potential_sif_findings_list.map((finding) => (
                <div
                  key={finding.id}
                  className="p-4 rounded-xl dark:bg-slate-900/80 bg-slate-50 border dark:border-slate-800 border-slate-200 hover:dark:border-amber-500/40 hover:border-amber-300 transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-amber-500 dark:text-amber-400">
                        {finding.reference}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20">
                        Potential SIF Finding
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded-md dark:bg-slate-800 bg-white font-medium text-slate-700 dark:text-slate-300 border dark:border-slate-700 border-slate-200">
                        {finding.identified_hazard}
                      </span>
                      <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <MapPin size={12} />
                        {finding.location}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/10 text-xs">
                      <strong className="text-amber-600 dark:text-amber-400 font-semibold block mb-0.5">
                        Key Safety Signal: {finding.key_safety_signal}
                      </strong>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                        {finding.explanation}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t dark:border-slate-800/80 border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-[10px] font-mono text-slate-400">
                      {finding.created_at || "Analyzed"}
                    </span>
                    <Link
                      to={`/reports/${finding.id}`}
                      className="font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <span>View Full Analysis</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400">
              <p>No potential SIF precursor findings are currently available.</p>
            </div>
          )}
        </div>

        {/* ====================================================
            ROW 6: Reports Awaiting Human Review
           ==================================================== */}
        <div className="p-6 rounded-2xl dark:bg-[#0d121f] bg-white border dark:border-slate-800 border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b dark:border-slate-800 border-slate-100">
            <div>
              <h3 className="font-display text-base font-bold dark:text-white text-slate-900">
                Reports Awaiting Human Review
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AI analyses that require safety professional feedback.
              </p>
            </div>

            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0">
              {data.reports_awaiting_review?.length || 0} Pending Review
            </span>
          </div>

          {data.reports_awaiting_review?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b dark:border-slate-800 border-slate-200 text-slate-400 font-mono uppercase tracking-wider">
                    <th className="py-2.5 px-3">Report Reference</th>
                    <th className="py-2.5 px-3">Report Type</th>
                    <th className="py-2.5 px-3">Identified Hazard</th>
                    <th className="py-2.5 px-3">SIF Assessment</th>
                    <th className="py-2.5 px-3">Analysis Date</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-800/60 divide-slate-100 font-body">
                  {data.reports_awaiting_review.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:dark:bg-slate-800/30 hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {item.reference}
                      </td>
                      <td className="py-3 px-3 dark:text-slate-300 text-slate-700">
                        {item.report_type}
                      </td>
                      <td className="py-3 px-3 font-medium dark:text-white text-slate-900">
                        {item.identified_hazard}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            item.sif_assessment === "YES"
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                              : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                          }`}
                        >
                          SIF: {item.sif_assessment}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-400">
                        {item.analysis_date || "Recent"}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setReviewingReport(item);
                            setReviewFeedback("");
                            setAgreeWithAI(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <MessageSquareCheck size={13} />
                          <span>Review Analysis</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400">
              <p>No reports currently require human review.</p>
            </div>
          )}
        </div>
      </div>

      {/* ====================================================
          HUMAN REVIEW MODAL
         ==================================================== */}
      {reviewingReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl dark:bg-[#0d121f] bg-white border dark:border-slate-800 border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b dark:border-slate-800 border-slate-100">
              <div>
                <h4 className="font-display font-bold text-base dark:text-white text-slate-900">
                  Human-in-the-Loop Review
                </h4>
                <p className="text-xs text-slate-400">
                  Validating AI assessment for {reviewingReport.reference}
                </p>
              </div>
              <button
                onClick={() => setReviewingReport(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3.5 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-800 border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Report Type:</span>
                <strong className="dark:text-white text-slate-900">{reviewingReport.report_type}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Identified Hazard:</span>
                <strong className="dark:text-white text-slate-900">{reviewingReport.identified_hazard}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">AI SIF Determination:</span>
                <strong className={reviewingReport.sif_assessment === "YES" ? "text-amber-500" : "text-emerald-500"}>
                  {reviewingReport.sif_assessment}
                </strong>
              </div>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold dark:text-slate-200 text-slate-800 block">
                  Do you agree with the AI SIF precursor classification?
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="agree"
                      checked={agreeWithAI === true}
                      onChange={() => setAgreeWithAI(true)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="dark:text-slate-300 text-slate-700">Yes, agree with AI</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="agree"
                      checked={agreeWithAI === false}
                      onChange={() => setAgreeWithAI(false)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="dark:text-slate-300 text-slate-700">No, override AI determination</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold dark:text-slate-200 text-slate-800 block">
                  Expert Safety Feedback &amp; Validation Notes
                </label>
                <textarea
                  rows={3}
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder="Enter expert safety review remarks, barrier verification, or corrective action recommendations..."
                  className="w-full rounded-xl border dark:border-slate-700 border-slate-300 dark:bg-slate-900 bg-white p-3 text-xs dark:text-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewingReport(null)}
                  className="px-3.5 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview || !reviewFeedback.trim()}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
                >
                  <Send size={13} />
                  <span>{submittingReview ? "Submitting..." : "Submit Human Review"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
