import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileWarning, Calendar, Building2, MapPin, Tag, Activity, FileText } from "lucide-react";
import Layout from "../components/Layout";
import AnalysisResult from "../components/AnalysisResult";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import { getReport } from "../services/api";

function MetaRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b dark:border-white/[0.04] border-slate-100 last:border-0 hover:dark:bg-white/[0.02] hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={14} className="dark:text-slate-400 text-slate-400" />}
        <span className="text-xs font-mono uppercase tracking-wide dark:text-slate-400 text-slate-500 font-semibold">{label}</span>
      </div>
      <span className="text-xs sm:text-sm font-medium dark:text-white text-slate-900 font-body">{value || "—"}</span>
    </div>
  );
}

export default function ReportDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    getReport(id)
      .then((data) => {
        if (isMounted) setReport(data);
      })
      .catch(() => {
        if (isMounted) setError("Report record not found or backend service is unreachable.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <Layout
      title={`Safety Report Details #${id}`}
      description="Explainable AI natural language classification, barrier failure analysis, and safety signal attribution."
      action={
        <button
          onClick={() => navigate("/reports")}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono dark:text-slate-300 text-slate-700 hover:dark:text-white hover:text-slate-900 dark:bg-white/[0.04] bg-white hover:bg-slate-50 dark:hover:bg-white/10 border dark:border-white/10 border-slate-200 transition-all cursor-pointer shadow-xs"
        >
          <ArrowLeft size={14} /> Back to Safety Reports
        </button>
      }
    >
      {loading ? (
        <LoadingState label="Retrieving report record..." />
      ) : error || !report ? (
        <EmptyState icon={FileWarning} title="Report record unavailable" description={error} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start max-w-6xl">
          <div className="space-y-6">
            {/* Original Narrative Card */}
            <div className="glass-card rounded-2xl p-6 sm:p-7 border dark:border-white/10 border-slate-200/90 shadow-2xl">
              <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b dark:border-white/[0.08] border-slate-100">
                <span className="text-xs font-mono uppercase tracking-wider text-rose-500 font-bold flex items-center gap-1.5">
                  <FileText size={14} /> Original Incident Narrative
                </span>
                <span className="text-[11px] font-mono dark:text-slate-500 text-slate-400 font-semibold">ID #{report.id}</span>
              </div>
              <p className="text-sm sm:text-base dark:text-slate-100 text-slate-800 leading-relaxed font-body dark:bg-dark-900/60 bg-slate-50 p-4 rounded-xl border dark:border-white/5 border-slate-200">
                "{report.report_text}"
              </p>
            </div>

            {/* Ingestion Metadata Card */}
            <div className="glass-card rounded-2xl p-2 border dark:border-white/10 border-slate-200/90 shadow-2xl overflow-hidden">
              <MetaRow icon={Tag} label="Report Type" value={report.report_type} />
              <MetaRow icon={Building2} label="Facility / Site" value={report.site} />
              <MetaRow icon={MapPin} label="Observed Location" value={report.location} />
              <MetaRow icon={Activity} label="Work Activity" value={report.activity} />
              <MetaRow
                icon={Calendar}
                label="Timestamp Analyzed"
                value={
                  report.created_at
                    ? new Date(report.created_at).toLocaleString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : null
                }
              />
            </div>
          </div>

          {/* AI Inferences and Diagnosis */}
          <AnalysisResult result={report} />
        </div>
      )}
    </Layout>
  );
}
