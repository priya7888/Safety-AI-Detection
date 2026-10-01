import { useState } from "react";
import StatusBadge from "./StatusBadge";
import {
  Tag,
  MapPin,
  ShieldOff,
  ScrollText,
  Copy,
  Check,
  Zap,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";

function FieldCard({ icon: Icon, label, value, highlight = false, badge = null }) {
  return (
    <div
      className={`p-4 rounded-2xl border transition-all ${
        highlight
          ? "bg-rose-500/10 border-rose-500/30 text-rose-500 dark:text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.12)]"
          : "dark:bg-white/[0.03] bg-slate-50 dark:border-white/10 border-slate-200 dark:text-slate-200 text-slate-800"
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2">
          <span
            className={`w-7 h-7 rounded-xl flex items-center justify-center ${
              highlight ? "bg-rose-500/20 text-rose-500" : "dark:bg-white/5 bg-white dark:text-slate-300 text-slate-600 shadow-xs border dark:border-white/5 border-slate-200"
            }`}
          >
            <Icon size={15} strokeWidth={2.2} />
          </span>
          <span className="text-[11px] font-mono uppercase tracking-wider dark:text-slate-400 text-slate-500 font-semibold">
            {label}
          </span>
        </div>
        {badge}
      </div>
      <p className="text-sm font-semibold dark:text-white text-slate-900 truncate pl-1">
        {value || <span className="text-slate-400 font-normal italic">Not identified</span>}
      </p>
    </div>
  );
}

export default function AnalysisResult({ result }) {
  const [copied, setCopied] = useState(false);
  if (!result) return null;

  const confidencePct = Math.round((result.confidence_score || 0) * 100);
  const isSif = Boolean(result.sif_potential);

  const handleCopy = () => {
    const text = `SIF PRECURSOR ANALYSIS REPORT #${result.id || "NEW"}
Classification: ${isSif ? "SIF POTENTIAL (YES)" : "NON-SIF"}
Confidence: ${confidencePct}%
Activity: ${result.activity || "N/A"}
Location: ${result.location || "N/A"}
Defeated Barrier: ${result.barrier_failure || "None identified"}
Life-Saving Rules: ${result.life_saving_rules?.join(", ") || "None"}
Explanation: ${result.explanation || "N/A"}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-7 border dark:border-white/10 border-slate-200 space-y-6 shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Top Banner with Classification & Confidence Gauge */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-5 border-b dark:border-white/[0.08] border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider dark:text-slate-400 text-slate-500 font-semibold">
              AI CLASSIFICATION INFERENCE
            </span>
          </div>
          <StatusBadge sifPotential={result.sif_potential} size="lg" />
        </div>

        {/* Confidence Gauge */}
        <div className="text-right">
          <span className="text-[11px] font-mono uppercase tracking-wider dark:text-slate-400 text-slate-500 block mb-0.5 font-semibold">
            Model Confidence
          </span>
          <div className="flex items-baseline justify-end gap-1">
            <span
              className={`font-display text-3xl sm:text-4xl font-extrabold tracking-tight ${
                isSif ? "text-rose-500 dark:text-rose-400 text-glow-rose" : "text-emerald-600 dark:text-emerald-400 text-glow-emerald"
              }`}
            >
              {confidencePct}%
            </span>
          </div>
          <div className="w-28 h-1.5 dark:bg-white/10 bg-slate-200 rounded-full overflow-hidden mt-1 ml-auto">
            <div
              className={`h-full rounded-full ${isSif ? "bg-rose-500 shadow-[0_0_10px_#f43f5e]" : "bg-emerald-500 shadow-[0_0_10px_#10b981]"}`}
              style={{ width: `${confidencePct}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4 Extracted Attribute Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <FieldCard icon={Tag} label="Identified Activity" value={result.activity} />
        <FieldCard icon={MapPin} label="Extracted Location" value={result.location} />
        <FieldCard
          icon={ShieldOff}
          label="Defeated Barrier"
          value={result.barrier_failure}
          highlight={Boolean(result.barrier_failure && isSif)}
        />

        <div className="p-4 rounded-2xl dark:bg-white/[0.03] bg-slate-50 border dark:border-white/10 border-slate-200">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
              <ScrollText size={15} strokeWidth={2.2} />
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider dark:text-slate-400 text-slate-500 font-semibold">
              IOGP Life-Saving Rules
            </span>
          </div>
          {result.life_saving_rules?.length ? (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {result.life_saving_rules.map((rule) => (
                <span
                  key={rule}
                  className="text-xs font-mono font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-300 px-2.5 py-0.5 rounded-lg border border-amber-500/30 shadow-xs"
                >
                  {rule}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic mt-1 font-mono">No mandatory rule triggered</p>
          )}
        </div>
      </div>

      {/* Automated AI Explanation */}
      {result.explanation && (
        <div className="p-4 sm:p-5 rounded-2xl dark:bg-dark-900/90 bg-slate-50 border dark:border-white/[0.08] border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider dark:text-slate-400 text-slate-600 flex items-center gap-1.5 font-semibold">
              <Zap size={13} className="text-rose-500" />
              Automated Safety Rationale
            </span>
            <button
              onClick={handleCopy}
              className="text-xs font-mono dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900 flex items-center gap-1.5 transition-colors dark:bg-white/5 bg-white hover:dark:bg-white/10 hover:bg-slate-100 px-2.5 py-1 rounded-lg border dark:border-white/10 border-slate-200 cursor-pointer shadow-xs"
            >
              {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              <span>{copied ? "Copied" : "Copy Rationale"}</span>
            </button>
          </div>
          <p className="text-xs sm:text-sm dark:text-slate-300 text-slate-700 leading-relaxed font-body">
            {result.explanation}
          </p>
        </div>
      )}

      {/* Footer link to Incident Audit History if report saved */}
      {result.id && (
        <div className="pt-2 border-t dark:border-white/[0.06] border-slate-100 flex items-center justify-between text-xs">
          <span className="font-mono text-slate-400">Record ID: #{result.id}</span>
          <Link
            to={`/reports/${result.id}`}
            className="font-mono text-rose-500 dark:text-rose-400 hover:text-rose-600 flex items-center gap-1 transition-colors font-semibold"
          >
            <span>View Full Audit Record</span>
            <ExternalLink size={12} />
          </Link>
        </div>
      )}
    </div>
  );
}
