import React from 'react';
import { 
  ArrowRight, 
  TrendingUp, 
  AlertTriangle 
} from 'lucide-react';
import StatCard from '../common/StatCard';
import { 
  MOCK_ACTIVITY_DATA, 
  MOCK_HIGHEST_RISK_LOCATIONS, 
  MOCK_REQUIRES_ATTENTION 
} from '../data/mockData';

export default function OverviewPage({ onNavigate }) {
  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      
      {/* ================= 1. COMPACT GREETING & CONTEXT ================= */}
      <div className="pb-4 border-b border-white/[0.06]">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-heading">
          Good Morning, HSSE Team
        </h1>
        <p className="text-sm sm:text-base text-slate-300 mt-1 max-w-2xl leading-relaxed">
          Enterprise safety intelligence and operational risk overview.
        </p>
      </div>

      {/* ================= 2. 4 FOCUSED KPI CARDS ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          iconType="reports"
          value="1,248"
          label="Total Reports"
          trend="12%"
          isPositive={true}
          trendColor="green"
        />
        <StatCard
          iconType="sif"
          value="87"
          label="SIF Potential"
          trend="3%"
          isPositive={false}
          trendColor="red"
        />
        <StatCard
          iconType="precursors"
          value="143"
          label="Active Precursors"
          trend="5%"
          isPositive={true}
          trendColor="green"
        />
        <StatCard
          iconType="controls"
          value="31"
          label="Control Failures"
          trend="3%"
          isPositive={false}
          trendColor="red"
        />
      </div>

      {/* ================= 3. THREE CORE ANALYTICAL SECTIONS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* A. SIF Potential Trend Chart (col-span-5) */}
        <div className="lg:col-span-5 rounded-2xl bg-[#0f141e] border border-white/[0.08] p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-wide font-heading">
              SIF Potential Trend
            </h3>
            <p className="text-xs sm:text-sm text-red-400 font-medium mt-1 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              <span>Increasing (+3% over 6-month baseline)</span>
            </p>
          </div>

          {/* Clean Line / Area Chart */}
          <div className="relative w-full h-48 pt-1">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 400 150" fill="none">
              <defs>
                <linearGradient id="sifAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="30" y1="20" x2="390" y2="20" stroke="#ffffff" strokeOpacity="0.05" strokeDasharray="3 3" />
              <text x="6" y="24" fill="#64748b" fontSize="11" fontFamily="monospace">150</text>

              <line x1="30" y1="60" x2="390" y2="60" stroke="#ffffff" strokeOpacity="0.05" strokeDasharray="3 3" />
              <text x="6" y="64" fill="#64748b" fontSize="11" fontFamily="monospace">100</text>

              <line x1="30" y1="100" x2="390" y2="100" stroke="#ffffff" strokeOpacity="0.05" strokeDasharray="3 3" />
              <text x="12" y="104" fill="#64748b" fontSize="11" fontFamily="monospace">50</text>

              <line x1="30" y1="130" x2="390" y2="130" stroke="#ffffff" strokeOpacity="0.08" />
              <text x="18" y="134" fill="#64748b" fontSize="11" fontFamily="monospace">0</text>

              {/* Area fill */}
              <path
                d="M 50,118 Q 110,105 120,100 T 190,82 T 260,95 T 325,70 T 385,48 L 385,130 L 50,130 Z"
                fill="url(#sifAreaGrad)"
              />

              {/* Smooth Trend Line */}
              <path
                d="M 50,118 Q 110,105 120,100 T 190,82 T 260,95 T 325,70 T 385,48"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
              />

              {/* Data points */}
              <circle cx="50" cy="118" r="3.5" fill="#f59e0b" />
              <circle cx="120" cy="100" r="3.5" fill="#f59e0b" />
              <circle cx="190" cy="82" r="3.5" fill="#f59e0b" />
              <circle cx="260" cy="95" r="3.5" fill="#f59e0b" />
              <circle cx="325" cy="70" r="3.5" fill="#f59e0b" />
              <circle cx="385" cy="48" r="5" fill="#fbbf24" stroke="#0f141e" strokeWidth="2.5" />

              {/* X Axis Labels */}
              <text x="43" y="148" fill="#64748b" fontSize="11" fontFamily="sans-serif">Mar</text>
              <text x="113" y="148" fill="#64748b" fontSize="11" fontFamily="sans-serif">Apr</text>
              <text x="183" y="148" fill="#64748b" fontSize="11" fontFamily="sans-serif">May</text>
              <text x="253" y="148" fill="#64748b" fontSize="11" fontFamily="sans-serif">Jun</text>
              <text x="318" y="148" fill="#64748b" fontSize="11" fontFamily="sans-serif">Jul</text>
              <text x="375" y="148" fill="#fbbf24" fontSize="11.5" fontFamily="sans-serif" fontWeight="bold">Aug (87)</text>
            </svg>
          </div>
        </div>

        {/* B. Reports by Activity (col-span-3) */}
        <div className="lg:col-span-3 rounded-2xl bg-[#0f141e] border border-white/[0.08] p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-wide font-heading">
              Reports by Activity
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Top operational domains</p>
          </div>

          <div className="my-auto py-3 space-y-3.5">
            {MOCK_ACTIVITY_DATA.map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-200 font-medium">{item.label}</span>
                  <span className="font-mono text-slate-300 font-bold">{item.percentage}% ({item.count})</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full rounded-full" 
                    style={{ width: `${item.percentage}%`, backgroundColor: item.color }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* C. Highest-Risk Locations Table (col-span-4) - Removed Trend column */}
        <div className="lg:col-span-4 rounded-2xl bg-[#0f141e] border border-white/[0.08] p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-wide font-heading">
              Highest-Risk Locations
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Ranked by SIF Potential count</p>
          </div>

          {/* Clean 2-Column Location Table (Without Trend column) */}
          <div className="overflow-x-auto my-auto py-2">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06] text-slate-400 text-xs uppercase font-mono">
                  <th className="pb-2.5 font-semibold">Location</th>
                  <th className="pb-2.5 text-right font-semibold">SIF Potential</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {MOCK_HIGHEST_RISK_LOCATIONS.map((loc) => (
                  <tr key={loc.location} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 font-medium text-slate-200 text-sm">
                      {loc.location}
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold text-amber-400 text-base">
                      {loc.sifPotential}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-3 border-t border-white/[0.06] text-right">
            <button
              onClick={() => onNavigate('sif_intelligence')}
              className="text-xs sm:text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>View location breakdown</span>
              <span>→</span>
            </button>
          </div>
        </div>

      </div>

      {/* ================= 4. REQUIRES ATTENTION (FOCUSED BOTTOM SECTION) ================= */}
      <div className="rounded-2xl bg-[#0f141e] border border-white/[0.08] p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide font-heading">
                REQUIRES ATTENTION
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Top 3 high-priority precursor signals requiring immediate barrier verification
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('sif_intelligence')}
            className="text-xs sm:text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>View SIF Intelligence</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 3 High-Priority Pattern Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MOCK_REQUIRES_ATTENTION.map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigate('sif_intelligence')}
              className="p-5 rounded-xl bg-[#121826] border border-white/[0.06] hover:border-amber-500/40 transition-all cursor-pointer group flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                    {item.priority} PRIORITY
                  </span>
                  <span className="text-sm font-mono font-bold text-red-400">
                    {item.detail.split(' · ').pop()}
                  </span>
                </div>

                <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                  {item.title}
                </h4>

                <p className="text-xs sm:text-sm text-slate-300 mt-1.5 font-mono">
                  {item.detail}
                </p>
              </div>

              <div className="pt-2.5 border-t border-white/[0.06] text-xs sm:text-sm text-slate-300 space-y-1">
                <p className="font-medium text-slate-200 truncate">{item.consequence}</p>
                <p className="text-xs text-slate-400 truncate">Barrier: <strong className="text-slate-300">{item.criticalControl}</strong></p>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
