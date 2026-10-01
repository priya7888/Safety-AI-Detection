import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  BarChart3, 
  PieChart, 
  Calendar, 
  Filter, 
  Download, 
  FileText, 
  ShieldAlert, 
  Activity, 
  Layers, 
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import PageHeader from '../common/PageHeader';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('Last 6 Months');
  const [selectedAsset, setSelectedAsset] = useState('ALL');

  // Asset configurations and scaling profiles
  const assetProfiles = {
    ALL: {
      name: 'All OIL INDIA Assets',
      multiplier: 1.0,
      leadHazard: 'Balanced Multi-Facility Risk',
      energyWeights: { gravity: 32, pressure: 26, electrical: 19, kinetic: 13, chemical: 10 },
      shiftBias: { morning: 1.0, afternoon: 1.0, night: 1.0 }
    },
    RIG04: {
      name: 'Assam Rig 04 (Drilling)',
      multiplier: 0.28,
      leadHazard: 'Drilling & Suspended Heavy Casing',
      energyWeights: { gravity: 44, pressure: 18, electrical: 12, kinetic: 22, chemical: 4 },
      shiftBias: { morning: 0.9, afternoon: 1.1, night: 1.35 }
    },
    DULIAJAN: {
      name: 'Duliajan CPF (Processing)',
      multiplier: 0.38,
      leadHazard: 'Hydrocarbon High-Pressure Piping',
      energyWeights: { gravity: 10, pressure: 44, electrical: 18, kinetic: 8, chemical: 20 },
      shiftBias: { morning: 1.0, afternoon: 1.15, night: 0.95 }
    },
    DIGBOI: {
      name: 'Digboi Facility (Refining)',
      multiplier: 0.18,
      leadHazard: 'Electrical Substations & Distillation',
      energyWeights: { gravity: 14, pressure: 28, electrical: 34, kinetic: 8, chemical: 16 },
      shiftBias: { morning: 0.95, afternoon: 1.05, night: 1.1 }
    },
    NAHARKATIYA: {
      name: 'Naharkatiya Station (Gathering)',
      multiplier: 0.16,
      leadHazard: 'Gas Compressor & Vibration Fatigue',
      energyWeights: { gravity: 12, pressure: 36, electrical: 16, kinetic: 30, chemical: 6 },
      shiftBias: { morning: 1.05, afternoon: 0.95, night: 1.2 }
    }
  };

  // Time horizon base analytics data
  const timeProfiles = {
    'Last 30 Days': {
      baseTotal: 214,
      trendText: '↗ 8% vs prior 30d',
      sifRatioNum: 7.94,
      barrierFailNum: 3.27,
      mttr: '3.4 hrs',
      xLabels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5'],
      precursorRaw: [32, 45, 38, 56, 43],
      sifRaw: [3, 4, 3, 5, 2]
    },
    'Last 90 Days': {
      baseTotal: 582,
      trendText: '↗ 10% vs prior 90d',
      sifRatioNum: 7.21,
      barrierFailNum: 2.74,
      mttr: '3.9 hrs',
      xLabels: ['Month 1 (Jun)', 'Month 2 (Jul)', 'Month 3 (Aug)', 'Current (Sep)'],
      precursorRaw: [142, 178, 168, 94],
      sifRaw: [10, 14, 12, 6]
    },
    'Last 6 Months': {
      baseTotal: 1248,
      trendText: '↗ 12% vs last period',
      sifRatioNum: 6.97,
      barrierFailNum: 2.48,
      mttr: '4.2 hrs',
      xLabels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
      precursorRaw: [110, 145, 132, 165, 188, 179],
      sifRaw: [10, 14, 11, 12, 15, 12]
    },
    'Year-to-Date': {
      baseTotal: 2416,
      trendText: '↗ 15% YoY Growth',
      sifRatioNum: 6.45,
      barrierFailNum: 2.19,
      mttr: '4.5 hrs',
      xLabels: ['Q1 (Jan-Mar)', 'Q2 (Apr-Jun)', 'Q3 (Jul-Sep)', 'Q4 (Projected)'],
      precursorRaw: [580, 740, 810, 286],
      sifRaw: [38, 48, 54, 16]
    }
  };

  // Dynamically compute all analytical models based on active timeRange & selectedAsset
  const computedData = useMemo(() => {
    const tProf = timeProfiles[timeRange] || timeProfiles['Last 6 Months'];
    const aProf = assetProfiles[selectedAsset] || assetProfiles.ALL;

    const totalObs = Math.round(tProf.baseTotal * aProf.multiplier);
    const sifEvents = Math.max(1, Math.round(totalObs * (tProf.sifRatioNum / 100)));
    const barrierFailures = Math.max(1, Math.round(totalObs * (tProf.barrierFailNum / 100)));
    const calculatedSifRatio = ((sifEvents / totalObs) * 100).toFixed(2);
    const calculatedBarrierRate = ((barrierFailures / totalObs) * 100).toFixed(2);

    // Dynamic scaled curve points
    const scaledPrecursors = tProf.precursorRaw.map(v => Math.max(2, Math.round(v * aProf.multiplier)));
    const scaledSif = tProf.sifRaw.map(v => Math.max(1, Math.round(v * aProf.multiplier)));

    // Energy wheel distribution
    const ew = aProf.energyWeights;
    const energyItems = [
      { type: 'Gravity & Suspended Loads', percentage: ew.gravity, count: Math.round(totalObs * (ew.gravity / 100)), color: '#f59e0b' },
      { type: 'Pressure & Flammables', percentage: ew.pressure, count: Math.round(totalObs * (ew.pressure / 100)), color: '#d97706' },
      { type: 'Electrical & Arc Flash', percentage: ew.electrical, count: Math.round(totalObs * (ew.electrical / 100)), color: '#b45309' },
      { type: 'Kinetic & Rotating Equipment', percentage: ew.kinetic, count: Math.round(totalObs * (ew.kinetic / 100)), color: '#fbbf24' },
      { type: 'Chemical Toxicity & Corrosives', percentage: ew.chemical, count: Math.round(totalObs * (ew.chemical / 100)), color: '#78350f' }
    ];

    // Shift risk data
    const mMorning = Math.round(totalObs * 0.35 * aProf.shiftBias.morning);
    const mAfternoon = Math.round(totalObs * 0.42 * aProf.shiftBias.afternoon);
    const mNight = Math.max(1, totalObs - mMorning - mAfternoon);

    const scoreMorning = Math.min(95, Math.round(34 * aProf.shiftBias.morning));
    const scoreAfternoon = Math.min(95, Math.round(48 * aProf.shiftBias.afternoon));
    const scoreNight = Math.min(95, Math.round(72 * aProf.shiftBias.night));

    const shifts = [
      { 
        shift: 'Morning Shift (06:00 - 14:00)', 
        riskScore: scoreMorning, 
        reports: mMorning, 
        trend: scoreMorning > 40 ? 'Moderate Alert' : 'Normal Operations' 
      },
      { 
        shift: 'Afternoon Shift (14:00 - 22:00)', 
        riskScore: scoreAfternoon, 
        reports: mAfternoon, 
        trend: scoreAfternoon > 50 ? 'Elevated Fatigue' : 'Standard Routine' 
      },
      { 
        shift: 'Night Shift (22:00 - 06:00)', 
        riskScore: scoreNight, 
        reports: mNight, 
        trend: scoreNight > 65 ? 'High Precursor Risk' : 'Elevated Vigilance' 
      }
    ];

    // SVG geometry calculations
    const numPoints = tProf.xLabels.length;
    const maxVal = Math.max(...scaledPrecursors) * 1.15 || 10;
    
    // Generate coordinate pairs
    const precursorCoords = scaledPrecursors.map((val, idx) => {
      const x = 50 + (idx / (numPoints - 1)) * 410;
      const y = 150 - (val / maxVal) * 120;
      return { x, y, val };
    });

    const sifCoords = scaledSif.map((val, idx) => {
      const x = 50 + (idx / (numPoints - 1)) * 410;
      const y = 150 - (val / maxVal) * 120;
      return { x, y, val };
    });

    const createSvgPath = (points) => {
      if (!points.length) return '';
      return points.reduce((acc, pt, i) => {
        if (i === 0) return `M ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
        const prev = points[i - 1];
        const cx = ((prev.x + pt.x) / 2).toFixed(1);
        return `${acc} C ${cx},${prev.y.toFixed(1)} ${cx},${pt.y.toFixed(1)} ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
      }, '');
    };

    return {
      totalObs,
      trendText: tProf.trendText,
      sifEvents,
      calculatedSifRatio,
      barrierFailures,
      calculatedBarrierRate,
      mttr: tProf.mttr,
      xLabels: tProf.xLabels,
      maxVal: Math.round(maxVal),
      precursorCoords,
      sifCoords,
      precursorPath: createSvgPath(precursorCoords),
      sifPath: createSvgPath(sifCoords),
      energyItems,
      shifts,
      assetName: aProf.name,
      leadHazard: aProf.leadHazard
    };
  }, [timeRange, selectedAsset]);

  // Export dynamically tailored CSV
  const handleExportAnalytics = () => {
    const headers = ["Metric,Value,Context"];
    const rows = [
      `"Time Horizon","${timeRange}","Analysis Range"`,
      `"Asset Scope","${computedData.assetName}","Operating Site"`,
      `"Total Observations","${computedData.totalObs}","${computedData.trendText}"`,
      `"SIF Potential Events","${computedData.sifEvents}","Ratio: ${computedData.calculatedSifRatio}%"`,
      `"Control Barrier Failures","${computedData.barrierFailures}","Rate: ${computedData.calculatedBarrierRate}%"`,
      `"Mean Time to Barrier Fix","${computedData.mttr}","Target < 6.0 hrs"`,
      `"Primary Operational Hazard","${computedData.leadHazard}","IOGP Risk Category"`
    ];

    rows.push(`"--- ENERGY WHEEL BREAKDOWN ---","---","---"`);
    computedData.energyItems.forEach(e => {
      rows.push(`"${e.type}","${e.percentage}%","${e.count} reports"`);
    });

    rows.push(`"--- SHIFT RISK BREAKDOWN ---","---","---"`);
    computedData.shifts.forEach(s => {
      rows.push(`"${s.shift}","Score: ${s.riskScore}/100","${s.reports} reports (${s.trend})"`);
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const fileAsset = selectedAsset === 'ALL' ? 'all_assets' : selectedAsset.toLowerCase();
    const fileTime = timeRange.toLowerCase().replace(/\s+/g, '_');
    link.setAttribute("download", `safetyai_analytics_${fileAsset}_${fileTime}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      
      {/* Page Header */}
      <PageHeader
        title="Analytics"
        subtitle="Analyze recurring safety patterns, trends, activities, and locations."
        badge="Enterprise Analytics"
        actions={
          <button
            onClick={handleExportAnalytics}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export Analytics</span>
          </button>
        }
      />

      {/* Filter Control Bar */}
      <div className="p-4 rounded-2xl bg-[#0f141e] border border-white/[0.08] shadow-xl flex flex-wrap items-center justify-between gap-4">
        
        {/* Time Horizon Filter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
            <Filter className="w-4 h-4 text-amber-500" />
            <span>Time Horizon:</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#151c2a] p-1 rounded-xl border border-white/10">
            {['Last 30 Days', 'Last 90 Days', 'Last 6 Months', 'Year-to-Date'].map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  timeRange === r
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Asset Filter */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs text-slate-400 font-medium">Filter Asset:</span>
          <select
            value={selectedAsset}
            onChange={(e) => setSelectedAsset(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-[#151c2a] border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer font-medium"
          >
            <option value="ALL">All OIL INDIA Assets</option>
            <option value="RIG04">Assam Rig 04 (Drilling)</option>
            <option value="DULIAJAN">Duliajan CPF (Processing)</option>
            <option value="DIGBOI">Digboi Facility (Refining)</option>
            <option value="NAHARKATIYA">Naharkatiya Station (Gathering)</option>
          </select>
        </div>
      </div>

      {/* Dynamic Active Context Pill Bar */}
      <div className="px-4 py-2.5 rounded-xl bg-[#121826] border border-amber-500/20 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span className="text-slate-400">Current Scope:</span>
          <strong className="text-white font-semibold">{computedData.assetName}</strong>
          <span className="text-slate-600">|</span>
          <span className="font-mono text-amber-400">{timeRange}</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="text-slate-400">Primary Risk Profile: <strong className="text-slate-200">{computedData.leadHazard}</strong></span>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400">{computedData.totalObs} Logged Events</span>
        </div>
      </div>

      {/* Summary Metrics Row (Dynamically Calculated) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0f141e] border border-white/[0.08] shadow-lg transition-all">
          <span className="text-xs text-slate-400 font-medium">Total Observations</span>
          <div className="text-2xl font-bold text-white font-sans mt-1.5">{computedData.totalObs.toLocaleString()}</div>
          <span className="text-[11px] text-emerald-400 font-mono mt-1 block">{computedData.trendText}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f141e] border border-red-500/20 shadow-lg transition-all">
          <span className="text-xs text-red-400 font-medium">SIF Precursor Ratio</span>
          <div className="text-2xl font-bold text-red-400 font-sans mt-1.5">{computedData.calculatedSifRatio}%</div>
          <span className="text-[11px] text-slate-400 font-mono mt-1 block">{computedData.sifEvents} SIF Potential Events</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f141e] border border-amber-500/20 shadow-lg transition-all">
          <span className="text-xs text-amber-400 font-medium">Control Barrier Failure Rate</span>
          <div className="text-2xl font-bold text-amber-400 font-sans mt-1.5">{computedData.calculatedBarrierRate}%</div>
          <span className="text-[11px] text-slate-400 font-mono mt-1 block">{computedData.barrierFailures} Degraded / Defeated</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f141e] border border-emerald-500/20 shadow-lg transition-all">
          <span className="text-xs text-emerald-400 font-medium">Mean Time to Barrier Fix</span>
          <div className="text-2xl font-bold text-emerald-400 font-sans mt-1.5">{computedData.mttr}</div>
          <span className="text-[11px] text-emerald-400 font-mono mt-1 block">Target &lt; 6.0 hrs (Met)</span>
        </div>
      </div>

      {/* Two Core Analytics Visuals Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* SIF vs Precursors Correlation Trend (col-span-7) */}
        <div className="lg:col-span-7 rounded-2xl bg-[#0f141e] border border-white/[0.08] p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide font-heading">
                SIF Potential vs. Precursor Frequency Trend
              </h3>
              <p className="text-xs text-slate-400">
                Evaluating weak signal volume vs serious incident potential for {computedData.assetName} ({timeRange})
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-1 bg-amber-500 inline-block rounded" /> SIF Potential
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-1 bg-emerald-500 inline-block rounded" /> Precursors
              </span>
            </div>
          </div>

          {/* Dynamic Dual Line SVG Chart */}
          <div className="w-full h-60 pt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 185" fill="none">
              {/* Horizontal Grid lines */}
              <line x1="40" y1="25" x2="480" y2="25" stroke="#ffffff" strokeOpacity="0.05" strokeDasharray="3 3" />
              <line x1="40" y1="65" x2="480" y2="65" stroke="#ffffff" strokeOpacity="0.05" strokeDasharray="3 3" />
              <line x1="40" y1="105" x2="480" y2="105" stroke="#ffffff" strokeOpacity="0.05" strokeDasharray="3 3" />
              <line x1="40" y1="150" x2="480" y2="150" stroke="#ffffff" strokeOpacity="0.1" />

              {/* Dynamic Y Axis Values */}
              <text x="10" y="28" fill="#64748b" fontSize="10" fontFamily="monospace">{computedData.maxVal}</text>
              <text x="10" y="68" fill="#64748b" fontSize="10" fontFamily="monospace">{Math.round(computedData.maxVal * 0.66)}</text>
              <text x="10" y="108" fill="#64748b" fontSize="10" fontFamily="monospace">{Math.round(computedData.maxVal * 0.33)}</text>
              <text x="20" y="154" fill="#64748b" fontSize="10" fontFamily="monospace">0</text>

              {/* Precursors Curve (Green) */}
              <path
                d={computedData.precursorPath}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all duration-300"
              />

              {/* SIF Potential Curve (Amber) */}
              <path
                d={computedData.sifPath}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] transition-all duration-300"
              />

              {/* Dynamic Precursor Data Circles */}
              {computedData.precursorCoords.map((pt, i) => (
                <g key={`prec-${i}`}>
                  <circle cx={pt.x} cy={pt.y} r="4" fill="#10b981" stroke="#0f141e" strokeWidth="2" />
                  <text x={pt.x} y={pt.y - 8} fill="#34d399" fontSize="9" fontFamily="monospace" textAnchor="middle">{pt.val}</text>
                </g>
              ))}

              {/* Dynamic SIF Potential Data Circles */}
              {computedData.sifCoords.map((pt, i) => (
                <g key={`sif-${i}`}>
                  <circle cx={pt.x} cy={pt.y} r="4" fill="#f59e0b" stroke="#0f141e" strokeWidth="2" />
                  <text x={pt.x} y={pt.y + 14} fill="#fbbf24" fontSize="9" fontFamily="monospace" textAnchor="middle">{pt.val}</text>
                </g>
              ))}

              {/* Dynamic X Axis Labels */}
              {computedData.xLabels.map((label, i) => {
                const x = 50 + (i / (computedData.xLabels.length - 1)) * 410;
                const isLast = i === computedData.xLabels.length - 1;
                return (
                  <text
                    key={label}
                    x={x}
                    y="172"
                    fill={isLast ? '#f59e0b' : '#64748b'}
                    fontSize="10.5"
                    fontFamily="sans-serif"
                    fontWeight={isLast ? 'bold' : 'normal'}
                    textAnchor="middle"
                  >
                    {label}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Energy Hazard Breakdown (col-span-5) */}
        <div className="lg:col-span-5 rounded-2xl bg-[#0f141e] border border-white/[0.08] p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide font-heading">
                Precursors by Energy Category
              </h3>
              <p className="text-xs text-slate-400">
                IOGP hazard allocation for {selectedAsset === 'ALL' ? 'All Sites' : selectedAsset}
              </p>
            </div>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {timeRange}
            </span>
          </div>

          {/* Dynamic Bars */}
          <div className="space-y-3.5 pt-2">
            {computedData.energyItems.map((item) => (
              <div key={item.type} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{item.type}</span>
                  <span className="font-mono text-amber-400 font-bold">{item.percentage}% ({item.count})</span>
                </div>
                <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${item.percentage}%`, backgroundColor: item.color }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Shift & Time-of-Day Analysis (Dynamically Computed) */}
      <div className="rounded-2xl bg-[#0f141e] border border-white/[0.08] p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide font-heading">
              Operational Shift & Fatigue Risk Heatmap
            </h3>
            <p className="text-xs text-slate-400">
              Rotational shift risk scores and precursor counts for {computedData.assetName} ({timeRange})
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg">
            3 Rotational Shifts Analyzed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {computedData.shifts.map((s) => (
            <div key={s.shift} className="p-4 rounded-xl bg-[#121826] border border-white/[0.06] space-y-2.5 transition-all">
              <span className="text-xs font-bold text-white block">{s.shift}</span>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold font-sans ${s.riskScore > 65 ? 'text-red-400' : s.riskScore > 45 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {s.riskScore}
                </span>
                <span className="text-xs text-slate-400">/ 100 Risk Score</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/[0.04]">
                <span>{s.reports} Reports Logged</span>
                <span className={`font-semibold ${s.riskScore > 65 ? 'text-red-400' : s.riskScore > 45 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {s.trend}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
