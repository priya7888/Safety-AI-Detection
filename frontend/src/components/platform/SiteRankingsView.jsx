import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  MapPin, 
  ArrowUpDown, 
  ChevronRight, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Layers, 
  X, 
  ArrowRight, 
  CheckCircle2, 
  Activity,
  FileText
} from 'lucide-react';
import { HorizontalRankingChart } from '../common/Charts';
import { getStoreState, subscribeSafetyStore } from '../../services/safetyStore';

export default function SiteRankingsView({ onFilterReportsBySite }) {
  const [storeState, setStoreState] = useState(getStoreState());
  const [sortField, setSortField] = useState('density');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);

  useEffect(() => {
    const unsub = subscribeSafetyStore(setStoreState);
    return unsub;
  }, []);

  const siteRankings = useMemo(() => {
    const reports = storeState.reports || [];
    if (reports.length === 0) return [];

    const siteMap = {};
    reports.forEach(r => {
      const site = r.location || 'Unit 1';
      if (!siteMap[site]) {
        siteMap[site] = {
          id: `SITE-${Object.keys(siteMap).length + 1}`,
          name: site,
          code: site.toUpperCase().replace(/\s+/g, '-'),
          category: 'Refinery Processing',
          totalReports: 0,
          sifReports: 0,
          exposureHours: 12000,
          topPrecursor: r.identified_hazard || 'Operational Safety Finding',
          topPrecursorLSR: 'Process Safety Control',
          status: 'Normal'
        };
      }
      siteMap[site].totalReports += 1;
      const isSIF = r.sif_precursor_assessment === 'YES' || r.risk_level === 'Critical' || (r.ai_score && r.ai_score >= 80);
      if (isSIF) siteMap[site].sifReports += 1;
    });

    return Object.values(siteMap).map(s => {
      const density = s.totalReports > 0 ? s.sifReports / s.totalReports : 0;
      return {
        ...s,
        density,
        status: density >= 0.25 ? 'Critical' : density >= 0.20 ? 'High' : density >= 0.15 ? 'Moderate' : 'Low'
      };
    });
  }, [storeState.reports]);

  const sortedSites = [...siteRankings].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    return sortAsc ? valA - valB : valB - valA;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const barChartData = [...siteRankings]
    .sort((a, b) => b.density - a.density)
    .map(s => ({
      name: s.name,
      code: s.code,
      value: +(s.density * 100).toFixed(1),
      subValue: `${s.sifReports} SIF / ${s.totalReports} Rep`,
      color: s.density >= 0.28 ? '#EF4444' : s.density >= 0.23 ? '#F59E0B' : s.density >= 0.17 ? '#EAB308' : '#10B981'
    }));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto select-none">
      
      {/* 1. Header & Ranking Philosophy Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
              Site & Activity SIF-Precursor Rankings
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Prioritizing corporate HSE interventions by SIF-precursor density (SIF Reports / Total Reports & Exposure Hours)
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 font-bold">
            &gt;25% Critical
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
            20-25% High
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 font-bold">
            15-20% Moderate
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
            &lt;15% Low
          </span>
        </div>
      </div>

      {/* 2. Horizontal Amber Gradient Bar Chart Ranking */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#090D16] border border-slate-800/90 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white font-heading">
              SIF-Precursor Density Hierarchy (% SIF Potential of Total Observations)
            </h3>
            <p className="text-xs text-slate-400">
              Highest precursor concentration facilities require immediate barrier inspection stand-downs
            </p>
          </div>
          <span className="text-xs font-mono text-amber-400 font-bold">Density Normalized</span>
        </div>

        <div className="pt-2">
          {barChartData.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 border border-slate-800/60 rounded-xl">
              <BarChart3 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="font-semibold text-slate-300">No site density data available yet.</p>
              <p className="text-slate-500 mt-1">Submit or upload safety reports across operating units to calculate real-time precursor density.</p>
            </div>
          ) : (
            <HorizontalRankingChart 
              data={barChartData} 
              maxValOverride={35}
              onBarClick={(item) => {
                const matched = siteRankings.find(s => s.code === item.code);
                if (matched) setSelectedSite(matched);
              }}
            />
          )}
        </div>
      </div>

      {/* 3. Sortable/Rankable Table */}
      <div className="rounded-2xl bg-[#090D16] border border-slate-800/90 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-white font-heading">
            Operating Site Hazard Density & Exposure Ledger
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Click any column header to toggle sorting
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0D1424] border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="p-3.5">Rank</th>
                <th className="p-3.5">Facility / Operating Site</th>
                <th className="p-3.5">Operations Category</th>
                <th 
                  className="p-3.5 cursor-pointer hover:text-amber-400 transition-colors"
                  onClick={() => handleSort('totalReports')}
                >
                  <div className="flex items-center gap-1">
                    <span>Total Reports</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="p-3.5 cursor-pointer hover:text-amber-400 transition-colors"
                  onClick={() => handleSort('sifReports')}
                >
                  <div className="flex items-center gap-1">
                    <span>SIF Precursors</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="p-3.5 cursor-pointer hover:text-amber-400 transition-colors"
                  onClick={() => handleSort('density')}
                >
                  <div className="flex items-center gap-1">
                    <span>SIF Density</span>
                    <ArrowUpDown className="w-3 h-3 text-amber-400" />
                  </div>
                </th>
                <th 
                  className="p-3.5 cursor-pointer hover:text-amber-400 transition-colors"
                  onClick={() => handleSort('exposureHours')}
                >
                  <div className="flex items-center gap-1">
                    <span>Exposure Hours</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3.5">Top Barrier Failure</th>
                <th className="p-3.5">Risk Tier</th>
                <th className="p-3.5 text-right">Drill-Down</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {sortedSites.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500 font-medium">
                    No operating site records available yet. Data will populate automatically upon report logging.
                  </td>
                </tr>
              ) : (
                sortedSites.map((site, index) => (
                  <tr 
                    key={site.id}
                    onClick={() => setSelectedSite(site)}
                    className="hover:bg-slate-850/80 transition-colors cursor-pointer group"
                  >
                  {/* Rank */}
                  <td className="p-3.5 font-mono font-bold text-slate-400 group-hover:text-amber-400">
                    #{index + 1}
                  </td>

                  {/* Site Name & Code */}
                  <td className="p-3.5">
                    <div className="font-bold text-white group-hover:text-amber-400 transition-colors">
                      {site.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {site.code}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="p-3.5 text-slate-300">
                    {site.category}
                  </td>

                  {/* Total Reports */}
                  <td className="p-3.5 font-mono font-bold">
                    {site.totalReports}
                  </td>

                  {/* SIF Reports */}
                  <td className="p-3.5 font-mono font-bold text-amber-400">
                    {site.sifReports}
                  </td>

                  {/* SIF Density */}
                  <td className="p-3.5 font-mono">
                    <span className="font-black text-white text-sm">
                      {(site.density * 100).toFixed(1)}%
                    </span>
                  </td>

                  {/* Exposure Hours */}
                  <td className="p-3.5 font-mono text-slate-400">
                    {site.exposureHours.toLocaleString()} hrs
                  </td>

                  {/* Top Failure */}
                  <td className="p-3.5 text-slate-300">
                    <div className="font-semibold text-amber-300/90">{site.topLSR}</div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[150px]">{site.topFailure}</div>
                  </td>

                  {/* Risk Tier Tag */}
                  <td className="p-3.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${site.badgeColor}`}>
                      {site.riskLevel}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="p-3.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSite(site);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 text-[11px] font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>Drill-Down</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. SITE DRILL-DOWN DRAWER */}
      {selectedSite && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div className="flex-1" onClick={() => setSelectedSite(null)} />

          <div className="w-full max-w-xl bg-[#090D16] border-l border-slate-800 h-full overflow-y-auto shadow-2xl flex flex-col justify-between text-left p-6 sm:p-8 space-y-6 custom-scrollbar animate-in slide-in-from-right duration-300">
            
            {/* Header */}
            <div className="space-y-2 pb-4 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                  {selectedSite.code}
                </span>

                <button
                  onClick={() => setSelectedSite(null)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h3 className="text-xl font-black text-white font-heading">
                {selectedSite.name}
              </h3>

              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>{selectedSite.category}</span>
                <span>•</span>
                <span className={`px-2 py-0.2 rounded-full font-bold border ${selectedSite.badgeColor}`}>
                  {selectedSite.riskLevel} RISK TIER
                </span>
              </div>
            </div>

            {/* Density Stat Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 font-mono">Total Reports</div>
                <div className="text-2xl font-black text-white font-mono mt-0.5">{selectedSite.totalReports}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/30 text-center">
                <div className="text-[10px] text-amber-400 font-mono font-semibold">SIF Potential</div>
                <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">{selectedSite.sifReports}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 font-mono">Density %</div>
                <div className="text-2xl font-black text-white font-mono mt-0.5">{(selectedSite.density * 100).toFixed(1)}%</div>
              </div>
            </div>

            {/* Life-Saving Rule Breakdown for This Site */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Life-Saving Rule Breakdown
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-amber-400">1. {selectedSite.topLSR}</span>
                  <span className="font-mono text-slate-300">45% of SIF reports</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: '45%' }} />
                </div>

                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="font-bold text-slate-300">2. Energy Isolation</span>
                  <span className="font-mono text-slate-400">30% of SIF reports</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-500 rounded-full" style={{ width: '30%' }} />
                </div>
              </div>
            </div>

            {/* Active Precursor Patterns at Site */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Active Precursor Patterns at Site
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1">
                <div className="font-bold text-red-400">{selectedSite.topFailure}</div>
                <div className="text-slate-400">
                  Recurring in recent shifts. Status: <strong className="text-amber-400">{selectedSite.status}</strong>
                </div>
              </div>
            </div>

            {/* Action CTA */}
            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  const site = selectedSite;
                  setSelectedSite(null);
                  if (onFilterReportsBySite) onFilterReportsBySite(site.name.split(' (')[0]);
                }}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer font-heading"
              >
                <span>View All {selectedSite.totalReports} Ingested Reports for This Site</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
