import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  MapPin,
  Calendar,
  Download
} from 'lucide-react';
import PageHeader from '../common/PageHeader';
import StatusBadge from '../common/StatusBadge';
import { MOCK_REPORTS } from '../data/mockData';

export default function SafetyReportsPage({ 
  onSelectReport, 
  reports = MOCK_REPORTS 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activityFilter, setActivityFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [sifFilter, setSifFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const handleExportCsv = () => {
    const headers = ["Report ID,Incident Summary,Activity,Asset Location,Logged Date,SIF Potential,AI Confidence,Status"];
    const rows = filteredReports.map(r => 
      `"${r.id}","${(r.title || '').replace(/"/g, '""')}","${r.activity}","${r.location}","${r.date}","${r.sifPotential ? 'YES' : 'NO'}","${r.confidence}%","${r.status}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "safety_reports_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter pipeline
  const filteredReports = useMemo(() => {
    return reports.filter((rep) => {
      // 1. Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchTitle = rep.title?.toLowerCase().includes(query);
        const matchId = rep.id?.toLowerCase().includes(query);
        const matchLoc = rep.location?.toLowerCase().includes(query);
        const matchAct = rep.activity?.toLowerCase().includes(query);
        if (!matchTitle && !matchId && !matchLoc && !matchAct) return false;
      }

      // 2. Activity filter
      if (activityFilter !== 'ALL' && rep.activity !== activityFilter) return false;

      // 3. Location filter
      if (locationFilter !== 'ALL' && rep.location !== locationFilter) return false;

      // 4. SIF Potential filter
      if (sifFilter === 'SIF_ONLY' && !rep.sifPotential) return false;
      if (sifFilter === 'NON_SIF' && rep.sifPotential) return false;

      // 5. Status filter
      if (statusFilter !== 'ALL' && rep.status !== statusFilter) return false;

      // 6. Date filter (Mock simple check)
      if (dateFilter === 'TODAY' && !rep.date?.includes('Sep')) return false;

      return true;
    });
  }, [reports, searchTerm, activityFilter, locationFilter, sifFilter, statusFilter, dateFilter]);

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage) || 1;
  const paginatedReports = filteredReports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const resetFilters = () => {
    setSearchTerm('');
    setActivityFilter('ALL');
    setLocationFilter('ALL');
    setSifFilter('ALL');
    setStatusFilter('ALL');
    setDateFilter('ALL');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-5 select-none animate-in fade-in duration-200">
      
      {/* Clean Top Header */}
      <PageHeader
        title="Safety Reports"
        subtitle="Review field observations, incidents, and AI-classified safety reports."
        badge="1,248 Total Reports"
        actions={
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export CSV</span>
          </button>
        }
      />

      {/* Compact Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#0f141e] border border-white/[0.08] shadow-lg space-y-3">
        
        {/* Search input & reset */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search reports by ID, description, or keyword..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#131926] border border-white/[0.08] focus:border-amber-500/50 text-xs text-white placeholder-slate-400 focus:outline-none"
            />
          </div>

          <button
            onClick={resetFilters}
            className="w-full sm:w-auto px-3 py-2 rounded-xl bg-[#131926] hover:bg-slate-800 border border-white/[0.08] text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Filter Dropdowns (5 clean filters) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2 border-t border-white/[0.04]">
          {/* Activity */}
          <div>
            <label className="block text-[10px] uppercase font-mono text-slate-400 font-bold mb-1">
              Activity
            </label>
            <select
              value={activityFilter}
              onChange={(e) => {
                setActivityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#151c2a] border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="ALL">All Activities</option>
              <option value="Drilling">Drilling</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Operations">Operations</option>
              <option value="Inspection">Inspection</option>
              <option value="Construction">Construction</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-[10px] uppercase font-mono text-slate-400 font-bold mb-1">
              Asset Location
            </label>
            <select
              value={locationFilter}
              onChange={(e) => {
                setLocationFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#151c2a] border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="ALL">All Locations</option>
              <option value="Rig 04">Assam Rig 04</option>
              <option value="Duliajan">Duliajan CPF</option>
              <option value="Digboi">Digboi Facility</option>
              <option value="Naharkatiya">Naharkatiya</option>
              <option value="Moran">Moran Field</option>
            </select>
          </div>

          {/* SIF Potential */}
          <div>
            <label className="block text-[10px] uppercase font-mono text-slate-400 font-bold mb-1">
              SIF Potential
            </label>
            <select
              value={sifFilter}
              onChange={(e) => {
                setSifFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#151c2a] border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="ALL">All SIF States</option>
              <option value="SIF_YES">YES (SIF Precursor)</option>
              <option value="SIF_NO">NO (Routine)</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[10px] uppercase font-mono text-slate-400 font-bold mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#151c2a] border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Investigate">Investigate</option>
              <option value="Reviewed">Reviewed</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-[10px] uppercase font-mono text-slate-400 font-bold mb-1">
              Date
            </label>
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#151c2a] border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="ALL">All Dates</option>
              <option value="7D">Last 7 Days</option>
              <option value="30D">Last 30 Days</option>
              <option value="YTD">Year-to-Date</option>
            </select>
          </div>
        </div>

      </div>

      {/* Main Table: Clean, readable columns matching prompt */}
      <div className="rounded-2xl bg-[#0f141e] border border-white/[0.08] shadow-xl overflow-hidden">
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="bg-[#121826] border-b border-white/[0.08] text-slate-400 text-[11px] font-semibold">
                <th className="py-3 px-4 font-medium">Report ID</th>
                <th className="py-3 px-4 font-medium">Incident Summary / Hazard</th>
                <th className="py-3 px-3 font-medium">Activity</th>
                <th className="py-3 px-3 font-medium">Asset Location</th>
                <th className="py-3 px-3 font-medium">Logged Date</th>
                <th className="py-3 px-3 font-medium">SIF Potential</th>
                <th className="py-3 px-3 font-medium">AI Confidence</th>
                <th className="py-3 px-3 font-medium">Status</th>
                <th className="py-3 px-4 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {paginatedReports.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold">No reports match the current filters.</p>
                    <button
                      onClick={resetFilters}
                      className="mt-2 text-xs font-semibold text-amber-400 hover:text-amber-300"
                    >
                      Reset filters
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedReports.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => onSelectReport(r)}
                    className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      {r.id}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-white group-hover:text-amber-300 transition-colors truncate">
                        {r.title}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-medium border border-slate-700/60">
                        {r.activity}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-300 truncate max-w-[150px]">
                      {r.location.split(' – ')[0]}
                    </td>
                    <td className="py-3.5 px-3 text-slate-400 font-mono text-[11px]">
                      {r.date}
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={r.sifPotential} type="sif" />
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-200">
                      {r.confidence}%
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectReport(r);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition-colors text-xs font-semibold cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3.5 border-t border-white/[0.06] bg-[#0c1017] flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <span className="text-white font-semibold">{filteredReports.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="text-white font-semibold">{Math.min(currentPage * itemsPerPage, filteredReports.length)}</span> of{' '}
            <span className="text-white font-semibold">{filteredReports.length}</span> reports
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentPage === num
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {num}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
