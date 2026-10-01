import { useEffect, useState, useCallback } from "react";
import { Search, ListFilter, ChevronLeft, ChevronRight, FilterX } from "lucide-react";
import Layout from "../components/Layout";
import ReportTable from "../components/ReportTable";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import { getReports } from "../services/api";

const PAGE_SIZE = 15;

const selectClass =
  "rounded-xl border dark:border-white/10 border-slate-200 dark:bg-dark-900/90 bg-white px-3.5 py-2 text-xs sm:text-sm dark:text-slate-200 text-slate-800 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/25 transition-all font-body";

export default function ReportHistory() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [sifStatus, setSifStatus] = useState("");
  const [reportType, setReportType] = useState("");
  const [site, setSite] = useState("");
  const [page, setPage] = useState(0);

  const fetchReports = useCallback(() => {
    setLoading(true);
    setError("");
    getReports({
      search: search || undefined,
      sif_status: sifStatus || undefined,
      report_type: reportType || undefined,
      site: site || undefined,
      skip: page * PAGE_SIZE,
      limit: PAGE_SIZE,
    })
      .then(setReports)
      .catch(() => setError("Could not load reports. Is the backend running at http://localhost:8000?"))
      .finally(() => setLoading(false));
  }, [search, sifStatus, reportType, site, page]);

  useEffect(() => {
    const t = setTimeout(fetchReports, 250); // debounce search input
    return () => clearTimeout(t);
  }, [fetchReports]);

  const resetPageAnd = (setter) => (val) => {
    setPage(0);
    setter(val);
  };

  const handleClearFilters = () => {
    setSearch("");
    setSifStatus("");
    setReportType("");
    setSite("");
    setPage(0);
  };

  const hasFilters = Boolean(search || sifStatus || reportType || site);

  return (
    <Layout
      title="Safety Reports"
      description="View, filter, and manage organizational safety observations and AI precursor evaluations."
    >
      <div className="space-y-6">
        {/* Search & Filter Toolbar */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 border dark:border-white/10 border-slate-200/90 flex flex-wrap items-center gap-3 shadow-2xl">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 dark:text-slate-400 text-slate-400" />
            <input
              className="w-full rounded-xl border dark:border-white/10 border-slate-200 dark:bg-dark-900/90 bg-white pl-10 pr-4 py-2 text-xs sm:text-sm dark:text-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/25 transition-all font-body"
              placeholder="Search narrative text, barrier, or activity..."
              value={search}
              onChange={(e) => resetPageAnd(setSearch)(e.target.value)}
            />
          </div>

          <select
            className={selectClass}
            value={sifStatus}
            onChange={(e) => resetPageAnd(setSifStatus)(e.target.value)}
          >
            <option value="" className="dark:bg-dark-900 bg-white dark:text-white text-slate-900">All SIF Status</option>
            <option value="yes" className="dark:bg-dark-900 bg-white text-rose-500">SIF Precursor (YES)</option>
            <option value="no" className="dark:bg-dark-900 bg-white text-emerald-600">Non-SIF (Routine)</option>
          </select>

          <select
            className={selectClass}
            value={reportType}
            onChange={(e) => resetPageAnd(setReportType)(e.target.value)}
          >
            <option value="" className="dark:bg-dark-900 bg-white dark:text-white text-slate-900">All Report Types</option>
            <option value="Unsafe Act" className="dark:bg-dark-900 bg-white dark:text-white text-slate-900">Unsafe Act</option>
            <option value="Unsafe Condition" className="dark:bg-dark-900 bg-white dark:text-white text-slate-900">Unsafe Condition</option>
            <option value="Near Miss" className="dark:bg-dark-900 bg-white dark:text-white text-slate-900">Near Miss</option>
          </select>

          <input
            className={`${selectClass} w-36`}
            placeholder="Filter by site"
            value={site}
            onChange={(e) => resetPageAnd(setSite)(e.target.value)}
          />

          {hasFilters && (
            <button
              onClick={handleClearFilters}
              className="text-xs font-mono dark:text-slate-400 text-slate-500 hover:text-rose-500 flex items-center gap-1 transition-colors px-2.5 py-2 rounded-xl dark:bg-white/5 bg-slate-100 hover:dark:bg-white/10 hover:bg-slate-200 cursor-pointer"
            >
              <FilterX size={13} /> Reset
            </button>
          )}
        </div>

        {/* Content Section */}
        {loading ? (
          <LoadingState label="Querying incident database..." />
        ) : error ? (
          <EmptyState icon={ListFilter} title="Unable to load reports" description={error} />
        ) : reports.length === 0 ? (
          <EmptyState
            icon={ListFilter}
            title="No reports match your filters"
            description="Try clearing search keywords or filters to view all historical incident records."
            action={
              hasFilters ? (
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 transition-all shadow-cyber-glow-sm cursor-pointer"
                >
                  Clear All Filters
                </button>
              ) : null
            }
          />
        ) : (
          <div className="space-y-4">
            <ReportTable reports={reports} />

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-2 px-2">
              <p className="text-xs font-mono dark:text-slate-400 text-slate-600">
                Showing <span className="dark:text-white text-slate-900 font-semibold">{page * PAGE_SIZE + 1}</span>–
                <span className="dark:text-white text-slate-900 font-semibold">{page * PAGE_SIZE + reports.length}</span> records
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="flex items-center gap-1 text-xs font-mono dark:text-slate-300 text-slate-700 disabled:opacity-30 hover:dark:text-white hover:text-slate-900 px-3 py-1.5 rounded-xl dark:bg-white/[0.04] bg-white hover:bg-slate-50 dark:hover:bg-white/10 border dark:border-white/10 border-slate-200 transition-all cursor-pointer disabled:cursor-not-allowed shadow-xs"
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={reports.length < PAGE_SIZE}
                  className="flex items-center gap-1 text-xs font-mono dark:text-slate-300 text-slate-700 disabled:opacity-30 hover:dark:text-white hover:text-slate-900 px-3 py-1.5 rounded-xl dark:bg-white/[0.04] bg-white hover:bg-slate-50 dark:hover:bg-white/10 border dark:border-white/10 border-slate-200 transition-all cursor-pointer disabled:cursor-not-allowed shadow-xs"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
