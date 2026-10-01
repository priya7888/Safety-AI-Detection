import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  UploadCloud,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Download,
  ArrowRight,
} from "lucide-react";
import Layout from "../components/Layout";
import { uploadReportsCsv } from "../services/api";

export default function BulkUpload() {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".csv")) {
      setError("Please select a standard .csv spreadsheet file.");
      return;
    }
    setError("");
    setSummary(null);
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setError("");
    try {
      const data = await uploadReportsCsv(file);
      setSummary(data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Upload failed. Please verify CSV column headers and backend status."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const downloadSampleCsv = () => {
    const csvContent =
      "report_text,report_type,site,location,activity\n" +
      '"Worker performed maintenance without isolating electrical energy.","Unsafe Act","Site A - Refinery","Electrical Substation","Maintenance"\n' +
      '"Contractor entered vessel without preliminary gas test.","Unsafe Condition","Site B - Storage","Tank #4","Confined Space Entry"\n' +
      '"Crane swung 4-ton load directly over active walkway.","Near Miss","Site A - Fabrication","Rigging Yard","Lifting Operation"\n' +
      '"Minor water spill in office kitchenette.","Unsafe Condition","HQ Complex","Kitchenette","Housekeeping"';
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "sample_safety_reports.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout
      title="Batch CSV Report Ingestion"
      description="Process and classify large volumes of Unsafe Act, Unsafe Condition, and Near-Miss incident logs in bulk."
      badge="Batch Pipeline"
    >
      <div className="max-w-3xl space-y-6">
        <div className="glass-card rounded-2xl p-6 sm:p-8 border dark:border-white/10 border-slate-200/90 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b dark:border-white/[0.08] border-slate-100">
            <p className="text-xs sm:text-sm dark:text-slate-300 text-slate-700 font-body">
              CSV required headers:{" "}
              <code className="bg-rose-500/10 px-2 py-0.5 rounded text-rose-500 font-mono text-xs font-semibold">
                report_text
              </code>{" "}
              and{" "}
              <code className="bg-rose-500/10 px-2 py-0.5 rounded text-rose-500 font-mono text-xs font-semibold">
                report_type
              </code>
              . Optional:{" "}
              <code className="dark:bg-white/5 bg-slate-100 px-1.5 py-0.5 rounded dark:text-slate-300 text-slate-700 font-mono text-xs">
                site, location, activity
              </code>
              .
            </p>
            <button
              onClick={downloadSampleCsv}
              className="text-xs font-mono text-rose-500 hover:text-rose-600 flex items-center gap-1.5 shrink-0 transition-colors bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/20 hover:border-rose-500/40 cursor-pointer font-medium"
            >
              <Download size={13} /> Download Template (.CSV)
            </button>
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-3.5 border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all ${
              dragActive
                ? "border-rose-500 bg-rose-500/10 shadow-[0_0_35px_rgba(244,63,94,0.2)] scale-[1.01]"
                : "dark:border-white/15 border-slate-300 hover:border-rose-500/50 dark:bg-dark-900/60 bg-slate-50/80 hover:bg-slate-100/80"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />

            {file ? (
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center mb-3 shadow-cyber-glow-sm">
                  <FileSpreadsheet size={28} />
                </div>
                <p className="text-sm font-semibold dark:text-white text-slate-900">{file.name}</p>
                <p className="text-xs font-mono dark:text-slate-400 text-slate-500 mt-1">
                  {(file.size / 1024).toFixed(1)} KB · Click to select different file
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200 text-slate-400 flex items-center justify-center mb-3 shadow-xs">
                  <UploadCloud size={28} className="text-rose-500" />
                </div>
                <p className="text-sm font-semibold dark:text-white text-slate-900">
                  Drag and drop your incident CSV here, or browse files
                </p>
                <p className="text-xs font-mono dark:text-slate-400 text-slate-500 mt-1">Supports standard .csv format up to 50MB</p>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-300 text-xs font-mono">
              <AlertCircle size={17} className="shrink-0 mt-0.5 text-rose-500" />
              <p>{error}</p>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-rose-500 via-rose-600 to-crimson-600 hover:from-rose-400 hover:to-rose-500 disabled:opacity-50 shadow-cyber-glow-sm transition-all cursor-pointer"
          >
            {isUploading ? <Loader2 size={17} className="animate-spin" /> : <UploadCloud size={17} />}
            <span>{isUploading ? "Ingesting & Classifying Records..." : "Upload & Analyze Batch"}</span>
          </button>
        </div>

        {/* Processing Results Summary */}
        {summary && (
          <div className="glass-card rounded-2xl p-6 sm:p-8 border dark:border-white/10 border-slate-200/90 space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold dark:text-white text-slate-900 tracking-tight flex items-center gap-2">
                <CheckCircle2 size={20} className="text-emerald-500" />
                Batch Ingestion Completed
              </h3>
              <span className="text-xs font-mono text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                SUCCESS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl dark:bg-white/[0.03] bg-slate-50 border dark:border-white/10 border-slate-200">
                <span className="text-xs font-mono uppercase tracking-wider dark:text-slate-400 text-slate-500 font-semibold">
                  Total Processed
                </span>
                <p className="font-display text-3xl font-extrabold dark:text-white text-slate-900 mt-1">
                  {summary.total_processed}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                <span className="text-xs font-mono uppercase tracking-wider text-rose-500 font-semibold">
                  SIF Precursors
                </span>
                <p className="font-display text-3xl font-extrabold text-rose-500 mt-1 flex items-center gap-2">
                  <AlertTriangle size={24} /> {summary.sif_potential_count}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold">
                  Non-SIF Reports
                </span>
                <p className="font-display text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-2">
                  <CheckCircle2 size={24} /> {summary.non_sif_count}
                </p>
              </div>
            </div>

            {summary.failed_rows > 0 && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25">
                <p className="text-xs font-mono font-semibold text-rose-500 mb-2">
                  {summary.failed_rows} row(s) skipped due to syntax / validation issues:
                </p>
                <ul className="text-xs font-mono dark:text-slate-300 text-slate-700 space-y-1 max-h-32 overflow-y-auto scrollbar-cyber">
                  {summary.errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2 border-t dark:border-white/[0.06] border-slate-100 flex items-center justify-between">
              <span className="text-xs font-mono dark:text-slate-400 text-slate-500">
                Telemetry stored & classified in database
              </span>
              <Link
                to="/reports"
                className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1.5 transition-colors font-mono cursor-pointer"
              >
                <span>Inspect in Incident History</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
