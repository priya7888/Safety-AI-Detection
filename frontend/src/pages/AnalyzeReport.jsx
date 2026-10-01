import { useState } from "react";
import { useLocation } from "react-router-dom";
import { AlertCircle, Radio } from "lucide-react";
import Layout from "../components/Layout";
import ReportForm from "../components/ReportForm";
import AnalysisResult from "../components/AnalysisResult";
import { analyzeReport } from "../services/api";

export default function AnalyzeReport() {
  const location = useLocation();
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const initialText = location.state?.prefill || "";

  const handleSubmit = async (payload) => {
    setIsSubmitting(true);
    setError("");
    setResult(null);
    try {
      const data = await analyzeReport(payload);
      setResult(data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Could not analyze the report. Please verify that the backend is running at http://localhost:8000."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout
      title="Submit Safety Report"
      description="UA, UC & Near-Miss natural language classification and explainable AI precursor detection."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <ReportForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          initialText={initialText}
        />

        <div>
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-300 text-xs font-mono mb-4">
              <AlertCircle size={17} className="shrink-0 mt-0.5 text-rose-500" />
              <p>{error}</p>
            </div>
          )}

          {result ? (
            <AnalysisResult result={result} />
          ) : (
            !error && (
              <div className="glass-card rounded-2xl p-12 sm:p-16 border border-dashed dark:border-white/10 border-slate-300 text-center flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-2xl dark:bg-white/[0.04] bg-slate-100 border dark:border-white/10 border-slate-200 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
                  <Radio size={26} className="text-rose-500 animate-pulse" />
                </div>
                <h3 className="font-display text-base sm:text-lg font-semibold dark:text-white text-slate-900">
                  Awaiting Safety Report
                </h3>
                <p className="text-xs sm:text-sm dark:text-slate-400 text-slate-500 max-w-sm mt-1.5 leading-relaxed font-body">
                  Enter an Unsafe Act, Unsafe Condition, or Near-Miss description on the left or select a 1-click test scenario to trigger real-time AI inference.
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </Layout>
  );
}
