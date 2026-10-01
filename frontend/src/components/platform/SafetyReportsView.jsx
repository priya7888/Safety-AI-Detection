import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  ArrowRight, 
  Calendar, 
  MapPin, 
  AlertCircle,
  Inbox,
  ShieldCheck, 
  ShieldAlert,
  Download,
  Flame,
  Layers,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../../services/api';

export default function SafetyReportsView({ onSelectReport, onOpenSubmit }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [reportType, setReportType] = useState('ALL');
  const [sifFilter, setSifFilter] = useState('ALL');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReports();
  }, [reportType]);

  const loadReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getReports({
        search: search.trim() || undefined,
        report_type: reportType
      });
      setReports(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load safety reports');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadReports();
  };

  // Client-side filtering by SIF Precursor
  const filteredReports = reports.filter((r) => {
    if (sifFilter === 'SIF_YES') return r.sif_precursor_assessment === 'YES';
    if (sifFilter === 'SIF_NO') return r.sif_precursor_assessment === 'NO';
    return true;
  });

  // Export to CSV functionality
  const handleExportCSV = () => {
    if (filteredReports.length === 0) return;
    const headers = ['Reference', 'Report Type', 'Location', 'Date', 'SIF Precursor', 'Hazard', 'Barrier Status', 'Description'];
    const rows = filteredReports.map(r => [
      `"${r.report_reference || ''}"`,
      `"${r.report_type || ''}"`,
      `"${r.location || ''}"`,
      `"${r.report_date || ''}"`,
      `"${r.sif_precursor_assessment || ''}"`,
      `"${(r.identified_hazard || '').replace(/"/g, '""')}"`,
      `"${r.barrier_information || ''}"`,
      `"${(r.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SIF_Sentinel_Reports_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-[1440px] mx-auto bg-[#F8FAFC]">
      
      {/* Search & Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by report ID, location, hazard, or description keywords..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all"
            />
          </form>

          {/* Filter Dropdowns & Export CTA */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Category Filter */}
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 cursor-pointer font-medium"
            >
              <option value="ALL">All Categories</option>
              <option value="UNSAFE_ACT">Unsafe Act</option>
              <option value="UNSAFE_CONDITION">Unsafe Condition</option>
              <option value="NEAR_MISS">Near-Miss</option>
            </select>

            {/* SIF Filter */}
            <select
              value={sifFilter}
              onChange={(e) => setSifFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 cursor-pointer font-bold"
            >
              <option value="ALL">All SIF Verdicts</option>
              <option value="SIF_YES">Potential SIF: YES Only</option>
              <option value="SIF_NO">Non-SIF Observations</option>
            </select>

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={filteredReports.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-200 disabled:opacity-50"
              title="Export filtered reports to CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>

            {/* New Report Button */}
            <button
              onClick={onOpenSubmit}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              <span>+ New Report</span>
            </button>

          </div>
        </div>

        {/* Count Pill */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 font-mono">
          <span>Showing <strong>{filteredReports.length}</strong> of <strong>{reports.length}</strong> safety records</span>
          <span className="text-orange-600 font-bold">
            {filteredReports.filter(r => r.sif_precursor_assessment === 'YES').length} SIF Precursors Active
          </span>
        </div>
      </div>

      {/* Reports Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs text-slate-500 font-mono">Fetching organization safety observations...</span>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-xs text-rose-600 font-medium">
            {error}
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800 font-heading">
              No Matching Safety Reports
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No observations match your current filter parameters. Try clearing the search or SIF filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-mono uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4 font-semibold">Reference</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Location</th>
                  <th className="py-3 px-4 font-semibold">Grounded Hazard / Observation</th>
                  <th className="py-3 px-4 font-semibold">Barrier Status</th>
                  <th className="py-3 px-4 font-semibold text-center">SIF Precursor</th>
                  <th className="py-3 px-4 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredReports.map((r) => {
                  const isSif = r.sif_precursor_assessment === 'YES';
                  const isBarrierDefect = r.barrier_information === 'BARRIER_FAILED' || r.barrier_information === 'BARRIER_MISSING';

                  return (
                    <tr
                      key={r.id}
                      onClick={() => onSelectReport(r.id)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {r.report_reference}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                          {r.report_type.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 font-medium">
                        <div className="flex items-center gap-1.5 max-w-[150px] truncate" title={r.location}>
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{r.location || 'Unspecified'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-800">
                        <div className="max-w-[260px] truncate font-medium" title={r.identified_hazard || r.description}>
                          {r.identified_hazard || r.description}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isBarrierDefect ? 'bg-rose-100 text-rose-800' :
                          r.barrier_information === 'BARRIER_PRESENT' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {r.barrier_information ? r.barrier_information.replace('BARRIER_', '') : 'UNKNOWN'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black font-mono tracking-wider ${
                          isSif ? 'bg-orange-500 text-white shadow-2xs' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {r.sif_precursor_assessment || 'PENDING'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button className="text-slate-500 group-hover:text-orange-600 inline-flex items-center gap-1 text-xs font-bold cursor-pointer">
                          <span>Inspect</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
