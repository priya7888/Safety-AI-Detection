import React from 'react';
import { ArrowUpRight, ArrowDownRight, FileText, AlertTriangle, Network, ShieldAlert } from 'lucide-react';

export default function StatCard({
  iconType = 'reports',
  value = '0',
  label = '',
  trend = '+0%',
  isPositive = true,
  trendColor = 'green', // 'green' or 'red'
}) {
  // Sparkline SVG paths matching the reference design
  const sparklineGreen = "M 0,22 Q 15,26 25,18 T 50,14 T 75,19 T 100,5";
  const sparklineRed = "M 0,18 Q 15,22 30,16 T 55,20 T 80,12 T 100,6";

  const renderIcon = () => {
    switch (iconType) {
      case 'reports':
        return (
          <div className="w-11 h-11 rounded-xl bg-emerald-950/70 border border-emerald-600/40 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-950/50">
            <FileText className="w-5 h-5" />
          </div>
        );
      case 'sif':
        return (
          <div className="w-11 h-11 rounded-xl bg-red-950/70 border border-red-600/40 text-red-400 flex items-center justify-center shadow-lg shadow-red-950/50">
            <AlertTriangle className="w-5 h-5" />
          </div>
        );
      case 'precursors':
        return (
          <div className="w-11 h-11 rounded-xl bg-emerald-950/70 border border-emerald-600/40 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-950/50">
            <Network className="w-5 h-5" />
          </div>
        );
      case 'controls':
        return (
          <div className="w-11 h-11 rounded-xl bg-amber-950/70 border border-amber-600/40 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-950/50">
            <ShieldAlert className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        );
    }
  };

  const isGreen = trendColor === 'green';

  return (
    <div className="bg-[#0f141e]/90 hover:bg-[#131926]/90 transition-all duration-200 border border-white/[0.08] hover:border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xl shadow-black/40 group relative overflow-hidden">
      {/* Top subtle highlight gradient */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      {/* Top Row: Icon + Value & Label */}
      <div className="flex items-center gap-4">
        {renderIcon()}
        <div className="flex flex-col min-w-0">
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans leading-tight">
            {value}
          </span>
          <span className="text-sm text-slate-300 font-semibold truncate">
            {label}
          </span>
        </div>
      </div>

      {/* Bottom Row: Trend + Sparkline */}
      <div className="flex items-center justify-between mt-4 pt-2.5 border-t border-white/[0.06]">
        {/* Trend Indicator */}
        <div className={`flex items-center gap-1.5 text-xs sm:text-sm font-bold ${
          isGreen ? 'text-emerald-400' : 'text-red-400'
        }`}>
          <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
          <span>{trend}</span>
        </div>

        {/* Dynamic Glowing Sparkline */}
        <div className="w-24 h-7">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 28" fill="none">
            <defs>
              <linearGradient id={`spark-${iconType}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isGreen ? '#10b981' : '#ef4444'} stopOpacity="0.3" />
                <stop offset="100%" stopColor={isGreen ? '#10b981' : '#ef4444'} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d={isGreen ? sparklineGreen : sparklineRed}
              fill="none"
              stroke={isGreen ? '#10b981' : '#ef4444'}
              strokeWidth="2"
              strokeLinecap="round"
              className="drop-shadow-[0_0_6px_rgba(16,185,129,0.35)]"
            />
            {/* End glowing point */}
            <circle
              cx="100"
              cy={isGreen ? "5" : "6"}
              r="2.5"
              fill={isGreen ? '#34d399' : '#f87171'}
              className="animate-pulse"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
