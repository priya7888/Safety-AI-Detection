import { useState, useEffect } from "react";
import { Loader2, Sparkles, Zap, RotateCcw } from "lucide-react";

const REPORT_TYPES = ["Unsafe Act", "Unsafe Condition", "Near Miss"];

const SAMPLE_SCENARIOS = [
  {
    label: "⚡ Energy Isolation",
    type: "Unsafe Act",
    site: "Site A - Refinery",
    location: "Motor Control Room B",
    activity: "Electrical Maintenance",
    text: "Worker performed maintenance on 480V pump motor without isolating electrical energy or applying LOTO lock.",
  },
  {
    label: "🛢️ Confined Space",
    type: "Unsafe Condition",
    site: "Site B - Storage",
    location: "Crude Storage Tank #4",
    activity: "Vessel Inspection",
    text: "Contractor entered separator vessel without preliminary atmospheric gas testing or ventilation verification.",
  },
  {
    label: "🏗️ Line of Fire",
    type: "Near Miss",
    site: "Site A - Fabrication",
    location: "Fabrication Yard",
    activity: "Rigging & Lifting Operations",
    text: "Crane operator swung 5-ton steel beam directly over active pedestrian pathway; workers had to scramble clear.",
  },
  {
    label: "🪜 Working at Height",
    type: "Unsafe Act",
    site: "Site C - Distillation",
    location: "Fractionator Tower Column",
    activity: "Scaffolding & Rigging",
    text: "Rigger observed standing on top scaffold guardrail at 8 meters height without safety harness attached.",
  },
  {
    label: "☕ Routine Spill (Non-SIF)",
    type: "Unsafe Condition",
    site: "HQ - Admin Complex",
    location: "Main Cafeteria",
    activity: "General Housekeeping",
    text: "Minor water spill on cafeteria linoleum floor; warning cone placed and janitorial team notified.",
  },
];

const inputClass =
  "w-full rounded-xl border dark:border-white/10 border-slate-200 dark:bg-dark-900/90 bg-white px-3.5 py-2.5 text-sm dark:text-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/25 transition-all font-body";

export default function ReportForm({ onSubmit, isSubmitting, initialText = "" }) {
  const [form, setForm] = useState({
    report_text: initialText || "",
    report_type: "Unsafe Act",
    site: "",
    location: "",
    activity: "",
    report_date: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialText) {
      setForm((f) => ({ ...f, report_text: initialText }));
    }
  }, [initialText]);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const loadScenario = (scenario) => {
    setForm({
      report_text: scenario.text,
      report_type: scenario.type,
      site: scenario.site,
      location: scenario.location,
      activity: scenario.activity,
      report_date: new Date().toISOString().split("T")[0],
    });
    setError("");
  };

  const handleReset = () => {
    setForm({
      report_text: "",
      report_type: "Unsafe Act",
      site: "",
      location: "",
      activity: "",
      report_date: "",
    });
    setError("");
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (form.report_text.trim().length < 5) {
      setError("Please enter a detailed safety narrative (at least 5 characters).");
      return;
    }
    setError("");
    const payload = {
      report_text: form.report_text.trim(),
      report_type: form.report_type,
      site: form.site.trim() || null,
      location: form.location.trim() || null,
      activity: form.activity.trim() || null,
      report_date: form.report_date ? new Date(form.report_date).toISOString() : null,
    };
    onSubmit(payload);
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 sm:p-7 border dark:border-white/10 border-slate-200/90 space-y-6 shadow-2xl">
      {/* 1-Click Quick Preset Scenarios */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-mono uppercase tracking-wider dark:text-slate-300 text-slate-700 flex items-center gap-1.5 font-semibold">
            <Zap size={13} className="text-rose-500" />
            Quick Test Scenarios (1-Click)
          </label>
          <button
            type="button"
            onClick={handleReset}
            className="text-[11px] font-mono dark:text-slate-400 text-slate-500 hover:text-rose-500 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw size={11} /> Clear Form
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_SCENARIOS.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => loadScenario(s)}
              className="text-xs px-3 py-1.5 rounded-xl dark:bg-white/[0.03] bg-slate-100 hover:bg-rose-500/15 dark:hover:bg-rose-500/15 dark:text-slate-300 text-slate-700 hover:text-rose-600 dark:hover:text-rose-300 border dark:border-white/[0.08] border-slate-200/80 hover:border-rose-500/30 transition-all font-body text-left hover:scale-[1.02] cursor-pointer shadow-xs"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Narrative Input Box */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-mono uppercase tracking-wider dark:text-slate-300 text-slate-700 flex items-center gap-1.5 font-semibold">
            <span>Safety Report Narrative</span>
            <span className="text-rose-500 font-bold">*</span>
          </label>
          <span className="text-[11px] font-mono dark:text-slate-400 text-slate-500">
            {form.report_text.length} chars · <kbd className="dark:bg-white/10 bg-slate-100 px-1 py-0.5 rounded text-[10px] border dark:border-white/10 border-slate-200">Ctrl+Enter</kbd>
          </span>
        </div>
        <textarea
          className={`${inputClass} min-h-[130px] resize-y text-sm leading-relaxed`}
          placeholder="Describe the unsafe act, unsafe condition, or near-miss observation (e.g. worker bypassed LOTO before working on 480V energized pump)..."
          value={form.report_text}
          onChange={update("report_text")}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* Metadata Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider dark:text-slate-300 text-slate-700 mb-1.5 font-semibold">
            Report Type <span className="text-rose-500">*</span>
          </label>
          <select className={inputClass} value={form.report_type} onChange={update("report_type")}>
            {REPORT_TYPES.map((t) => (
              <option key={t} value={t} className="dark:bg-dark-900 bg-white dark:text-white text-slate-900">
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider dark:text-slate-300 text-slate-700 mb-1.5 font-semibold">
            Observation Date
          </label>
          <input
            type="date"
            className={inputClass}
            value={form.report_date}
            onChange={update("report_date")}
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider dark:text-slate-300 text-slate-700 mb-1.5 font-semibold">
            Facility / Site
          </label>
          <input
            className={inputClass}
            placeholder="e.g. Site A - Refinery"
            value={form.site}
            onChange={update("site")}
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider dark:text-slate-300 text-slate-700 mb-1.5 font-semibold">
            Specific Location
          </label>
          <input
            className={inputClass}
            placeholder="e.g. Vessel #3, Rooftop, Substation"
            value={form.location}
            onChange={update("location")}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-mono uppercase tracking-wider dark:text-slate-300 text-slate-700 mb-1.5 font-semibold">
            Work Activity (Optional Context)
          </label>
          <input
            className={inputClass}
            placeholder="e.g. Confined Space Entry, Hot Work, Line Breaking"
            value={form.activity}
            onChange={update("activity")}
          />
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-300 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Submit Action Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-rose-500 via-rose-600 to-crimson-600 hover:from-rose-400 hover:to-rose-500 disabled:opacity-50 shadow-[0_0_30px_rgba(244,63,94,0.4)] hover:shadow-[0_0_40px_rgba(244,63,94,0.65)] hover:-translate-y-0.5 transition-all cursor-pointer"
      >
        {isSubmitting ? (
          <Loader2 size={18} className="animate-spin text-white" />
        ) : (
          <Sparkles size={18} className="text-white" />
        )}
        <span>{isSubmitting ? "Running AI Precursor Detection..." : "Run AI Precursor Detection"}</span>
      </button>
    </form>
  );
}
