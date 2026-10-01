import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  Download, 
  ChevronRight, 
  MapPin, 
  FileText,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api';

export default function AllReportsView({ onSelectReport }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSif, setFilterSif] = useState('ALL'); // 'ALL', 'SIF_ONLY', 'NON_SIF'

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await api.getReports();
      setReports(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    const isSIF = r.sif_precursor_assessment === 'YES';
    
    // Filter SIF vs Non-SIF
    if (filterSif === 'SIF_ONLY' && !isSIF) return false;
    if (filterSif === 'NON_SIF' && isSIF) return false;

    // Search query
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      r.report_reference?.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q) ||
      r.location?.toLowerCase().includes(q) ||
      r.identified_hazard?.toLowerCase().includes(q)
    );
  });

  const sifCount = reports.filter(r => r.sif_precursor_assessment === 'YES').length;
  const nonSifCount = reports.length - sifCount;

  // Export CSV functionality
  const handleExportCSV = () => {
    if (filteredReports.length === 0) return;
    const headers = ['Reference', 'Date', 'Location', 'Type', 'SIF Classification', 'Hazard', 'Description'];
    const rows = filteredReports.map(r => [
      `"${r.report_reference || ''}"`,
      `"${r.report_date || ''}"`,
      `"${r.location || ''}"`,
      `"${r.report_type || ''}"`,
      `"${r.sif_precursor_assessment === 'YES' ? 'SIF POTENTIAL' : 'NON-SIF'}"`,
      `"${(r.identified_hazard || '').replace(/"/g, '""')}"`,
      `"${(r.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SafetyAI_Reports_${filterSif}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 select-none">
      
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <FileText className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-heading">
              All Ingested Safety Reports & Triage Ledger
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Search, filter, and inspect all 401 observations. Click any report to view its full AI diagnostic dossier.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4 text-blue-600" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reports by ID (e.g. REP-ID001-0008), site (e.g. Rig 9), hazard, or keywords..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 text-xs text-slate-900 placeholder-slate-400 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 font-sans"
          />
        </div>

        {/* Filter Tabs: ALL, SIF POTENTIAL, NON-SIF */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterSif('ALL')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterSif === 'ALL'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Reports ({reports.length})
            </button>

            <button
              onClick={() => setFilterSif('SIF_ONLY')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterSif === 'SIF_ONLY'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>SIF Potential ({sifCount})</span>
            </button>

            <button
              onClick={() => setFilterSif('NON_SIF')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterSif === 'NON_SIF'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Non-SIF Routine ({nonSifCount})</span>
            </button>
          </div>

          <span className="text-xs font-mono text-slate-500">
            Showing <strong>{filteredReports.length}</strong> matching observations
          </span>
        </div>

      </div>

      {/* Reports Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono text-[11px] uppercase tracking-wider">
                <th className="p-3.5">Reference & Date</th>
                <th className="p-3.5">Report Type</th>
                <th className="p-3.5 w-96">Observation Narrative</th>
                <th className="p-3.5">AI SIF Verdict</th>
                <th className="p-3.5">Identified Hazard</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredReports.map((r) => {
                const isSIF = r.sif_precursor_assessment === 'YES';

                return (
                  <tr
                    key={r.id}
                    onClick={() => onSelectReport(r)}
                    className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                  >
                    <td className="p-3.5 font-mono">
                      <div className="font-bold text-blue-600 group-hover:underline">
                        {r.report_reference}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {r.report_date}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono font-semibold">
                        {r.report_type}
                      </span>
                    </td>

                    <td className="p-3.5 max-w-sm">
                      <p className="line-clamp-2 text-slate-600 leading-relaxed">
                        {r.description}
                      </p>
                    </td>

                    <td className="p-3.5">
                      {isSIF ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-black text-[10px] border border-amber-300">
                          <ShieldAlert className="w-3 h-3 text-amber-600" />
                          SIF POTENTIAL
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold text-[10px] border border-slate-200">
                          NON-SIF
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-slate-600 max-w-xs truncate font-mono text-[11px]">
                      {r.identified_hazard || 'Pending Analysis'}
                    </td>

                    <td className="p-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectReport(r);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white font-bold text-[11px] transition-all cursor-pointer"
                      >
                        Full Analysis →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
