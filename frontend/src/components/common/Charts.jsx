import React, { useState, useRef } from 'react';

// ============================================================================
// 1. HIGHLY INTERACTIVE GLASSY REPORT DISTRIBUTION DONUT CHART
// ============================================================================
export function ReportDistributionDonut({ data = [], totalReports = 0, size = 260 }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(null);

  // Crisp, modern, rich luminous colors (no deep/muddy dark colors)
  const colors = {
    UNSAFE_ACT: { 
      stroke: '#3B82F6', 
      fill: '#60A5FA', 
      glow: 'rgba(59, 130, 246, 0.4)',
      badge: 'bg-blue-50 text-blue-700 border-blue-200' 
    },
    UNSAFE_CONDITION: { 
      stroke: '#F59E0B', 
      fill: '#FBBF24', 
      glow: 'rgba(245, 158, 11, 0.4)',
      badge: 'bg-amber-50 text-amber-700 border-amber-200' 
    },
    NEAR_MISS: { 
      stroke: '#8B5CF6', 
      fill: '#A78BFA', 
      glow: 'rgba(139, 92, 246, 0.4)',
      badge: 'bg-purple-50 text-purple-700 border-purple-200' 
    },
  };

  const defaultItems = [
    { type: 'UNSAFE_ACT', label: 'Unsafe Act', count: 0, ...colors.UNSAFE_ACT },
    { type: 'UNSAFE_CONDITION', label: 'Unsafe Condition', count: 0, ...colors.UNSAFE_CONDITION },
    { type: 'NEAR_MISS', label: 'Near-Miss', count: 0, ...colors.NEAR_MISS },
  ];

  const items = defaultItems.map(def => {
    const found = data.find(d => d.type === def.type || d.label?.toLowerCase() === def.label.toLowerCase());
    return { ...def, count: found ? found.count : 0 };
  });

  const total = totalReports || items.reduce((sum, item) => sum + item.count, 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-56 text-center p-6 bg-white/50 backdrop-blur-md rounded-2xl border border-white/80 shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 mb-2.5 shadow-2xs">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
        </div>
        <p className="text-sm font-bold text-slate-800">No safety reports available yet.</p>
        <p className="text-xs text-slate-500 mt-1">Distribution will plot dynamically once reports are submitted</p>
      </div>
    );
  }

  const radius = 88;
  const strokeWidth = 30;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedDash = 0;

  // Active item determined by hover or persistent click selection
  const activeIdx = hoveredIdx !== null ? hoveredIdx : selectedIdx;
  const activeItem = activeIdx !== null ? items[activeIdx] : null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-8 w-full select-none py-2">
      
      {/* SVG Interactive Donut */}
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg 
          viewBox={`0 0 ${size} ${size}`} 
          className="w-full h-full transform -rotate-90 drop-shadow-sm transition-all"
        >
          <defs>
            <filter id="donutGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#F1F5F9"
            strokeWidth={strokeWidth}
          />

          {/* Interactive Slices */}
          {items.map((item, idx) => {
            if (item.count === 0) return null;
            const sliceDash = (item.count / total) * circumference;
            const offset = -accumulatedDash;
            accumulatedDash += sliceDash;
            const isActive = activeIdx === idx;

            return (
              <circle
                key={idx}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={item.stroke}
                strokeWidth={isActive ? strokeWidth + 8 : strokeWidth}
                strokeDasharray={`${sliceDash} ${circumference}`}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-300 cursor-pointer"
                filter={isActive ? 'url(#donutGlow)' : undefined}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => setSelectedIdx(selectedIdx === idx ? null : idx)}
              />
            );
          })}
        </svg>

        {/* Center of Donut: Dynamic Interactive Statistics */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <div className="p-3.5 rounded-full bg-white/90 backdrop-blur-md shadow-sm border border-white flex flex-col items-center justify-center w-32 h-32 transition-all duration-300">
            <span 
              className="text-3xl sm:text-4xl font-black font-mono tracking-tight transition-colors duration-200"
              style={{ color: activeItem ? activeItem.stroke : '#0F172A' }}
            >
              {activeItem ? activeItem.count : total}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 font-sans mt-0.5">
              {activeItem ? activeItem.label : 'Total Reports'}
            </span>
            {activeItem && (
              <span className="text-xs font-mono font-bold text-slate-500 mt-0.5">
                {((activeItem.count / total) * 100).toFixed(1)}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Legend Cards with Enlarged, Crisp Text */}
      <div className="space-y-2.5 w-full max-w-sm">
        {items.map((item, idx) => {
          const isActive = activeIdx === idx;
          const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;

          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              onClick={() => setSelectedIdx(selectedIdx === idx ? null : idx)}
              className={`p-3.5 rounded-2xl border backdrop-blur-md transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 ${
                isActive
                  ? 'bg-white/95 border-slate-400 shadow-md scale-[1.03] ring-2 ring-blue-500/20'
                  : 'bg-white/65 border-white/80 hover:bg-white/90 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="w-4 h-4 rounded-full shrink-0 shadow-xs transition-transform duration-200"
                  style={{
                    backgroundColor: item.stroke,
                    transform: isActive ? 'scale(1.3)' : 'scale(1)'
                  }}
                />
                <span className="text-sm font-bold text-slate-800 truncate">
                  {item.label}
                </span>
              </div>

              <div className="flex items-center gap-3 font-mono text-sm shrink-0">
                <span className="text-slate-500 text-xs font-semibold">{pct}%</span>
                <span className="font-extrabold text-slate-900 bg-white px-3 py-1 rounded-xl border border-slate-200/80 shadow-2xs">
                  {item.count}
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

// ============================================================================
// 2. HIGHLY INTERACTIVE GLASSY REPORTING TREND LINE CHART (WITH MOUSE SCRUBBING)
// ============================================================================
export function ReportingTrendLineChart({ data = [], timeFilter = 'All Time', onFilterChange }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const svgRef = useRef(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-56 text-center p-6 bg-white/50 backdrop-blur-md rounded-2xl border border-white/80 shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 mb-2.5 shadow-2xs">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
        </div>
        <p className="text-sm font-bold text-slate-800">Submit safety reports to view reporting trends.</p>
        <p className="text-xs text-slate-500 mt-1">Interactive timeline will automatically plot</p>
      </div>
    );
  }

  let filteredData = [...data];
  if (timeFilter === '7 Days') {
    filteredData = filteredData.slice(-7);
  } else if (timeFilter === '30 Days') {
    filteredData = filteredData.slice(-30);
  }

  const width = 600;
  const height = 230;
  const padLeft = 45;
  const padRight = 30;
  const padTop = 25;
  const padBottom = 45;

  const maxVal = Math.max(...filteredData.map(d => d.count), 1);
  const getX = (i) => filteredData.length === 1
    ? padLeft + (width - padLeft - padRight) / 2
    : padLeft + (i / (filteredData.length - 1)) * (width - padLeft - padRight);
  const getY = (val) => padTop + (1 - val / (maxVal * 1.3)) * (height - padTop - padBottom);

  const points = filteredData.map((d, i) => `${getX(i)},${getY(d.count)}`).join(' ');
  const areaD = filteredData.length > 1
    ? `M ${getX(0)},${height - padBottom} L ${points} L ${getX(filteredData.length - 1)},${height - padBottom} Z`
    : '';

  // Handle interactive scrubbing across entire SVG width
  const handleMouseMove = (e) => {
    if (!svgRef.current || filteredData.length <= 1) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * width;
    
    // Find closest index
    let closest = 0;
    let minDist = Infinity;
    filteredData.forEach((_, i) => {
      const dist = Math.abs(getX(i) - mouseX);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });
    setHoveredIdx(closest);
  };

  const handleMouseLeave = () => {
    setHoveredIdx(null);
  };

  // Format date helper: "2026-09-02" -> "Sep 02"
  const formatNiceDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const m = parseInt(parts[1], 10) - 1;
        return `${monthNames[m] || parts[1]} ${parts[2]}`;
      }
    } catch (e) {}
    return dateStr;
  };

  const activePoint = hoveredIdx !== null ? filteredData[hoveredIdx] : null;

  return (
    <div className="space-y-4 w-full select-none">
      
      {/* Time Filter Controls & Status Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-600 font-mono font-bold bg-white/80 px-3 py-1 rounded-xl border border-slate-200/70 shadow-2xs">
          {filteredData.length} observations plotted
        </span>

        {onFilterChange && (
          <div className="inline-flex items-center p-1 bg-white/70 backdrop-blur-md rounded-xl border border-white/80 shadow-xs text-xs">
            {['7 Days', '30 Days', 'All Time'].map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => onFilterChange(tf)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  timeFilter === tf
                    ? 'bg-blue-600 text-white shadow-xs scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SVG Canvas with Enlarged Axis Labels & Interactive Hover Crosshair */}
      <div className="h-56 w-full relative">
        <svg 
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-full overflow-visible cursor-crosshair" 
          preserveAspectRatio="none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id="luminousBlueArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines with enlarged, readable text */}
          {[0, Math.ceil(maxVal / 2), maxVal].map((val, idx) => (
            <g key={idx}>
              <line
                x1={padLeft}
                y1={getY(val)}
                x2={width - padRight}
                y2={getY(val)}
                stroke="#E2E8F0"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
              <text
                x={padLeft - 10}
                y={getY(val) + 4}
                fill="#64748B"
                fontSize="12"
                fontWeight="700"
                fontFamily="monospace"
                textAnchor="end"
              >
                {val}
              </text>
            </g>
          ))}

          {/* Glowing Luminous Area */}
          {areaD && <path d={areaD} fill="url(#luminousBlueArea)" />}

          {/* Main Polyline Curve */}
          {filteredData.length > 1 && (
            <polyline
              fill="none"
              stroke="#2563EB"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          )}

          {/* Interactive Scrubbing Vertical Line */}
          {hoveredIdx !== null && (
            <line
              x1={getX(hoveredIdx)}
              y1={padTop}
              x2={getX(hoveredIdx)}
              y2={height - padBottom}
              stroke="#3B82F6"
              strokeWidth="2"
              strokeDasharray="3 3"
            />
          )}

          {/* Data Points with Enlarged X-Axis Dates */}
          {filteredData.map((d, i) => {
            const isHovered = hoveredIdx === i;
            return (
              <g key={i}>
                <circle
                  cx={getX(i)}
                  cy={getY(d.count)}
                  r={isHovered ? 8 : 5}
                  fill={isHovered ? '#1D4ED8' : '#3B82F6'}
                  stroke="#FFFFFF"
                  strokeWidth="3"
                  className="transition-all duration-200"
                />
                <text
                  x={getX(i)}
                  y={height - 12}
                  fill={isHovered ? '#1D4ED8' : '#475569'}
                  fontSize="12"
                  fontWeight={isHovered ? '800' : '600'}
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  {formatNiceDate(d.date)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Glassmorphic Tooltip Pill with Live Details */}
        {activePoint && (
          <div
            className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-md text-slate-900 px-4 py-2 rounded-2xl text-xs font-mono shadow-lg pointer-events-none z-10 border border-slate-200/80 flex items-center gap-3"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <span className="font-extrabold text-blue-700 text-sm">{formatNiceDate(activePoint.date)}</span>
            <span className="text-slate-300">•</span>
            <span className="font-extrabold text-sm text-slate-900">{activePoint.count} report{activePoint.count > 1 ? 's' : ''} submitted</span>
          </div>
        )}
      </div>

    </div>
  );
}

// ============================================================================
// 3. HIGHLY INTERACTIVE GLASSY SIF PRECURSOR ASSESSMENT BAR CHART
// ============================================================================
export function SifPrecursorHorizontalBarChart({ data = [] }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const defaultMeta = {
    YES: { 
      label: 'Potential SIF Precursor (YES)', 
      desc: 'High severity / critical defense failure',
      color: '#EA580C', 
      gradient: 'from-amber-400 to-orange-500',
      badge: 'bg-orange-50 text-orange-700 border-orange-200' 
    },
    NO: { 
      label: 'Non-SIF (NO)', 
      desc: 'Routine housekeeping & low severity',
      color: '#10B981', 
      gradient: 'from-emerald-400 to-teal-500',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' 
    },
    INSUFFICIENT_INFORMATION: { 
      label: 'Insufficient Information', 
      desc: 'Observation requires additional details',
      color: '#64748B', 
      gradient: 'from-slate-300 to-slate-400',
      badge: 'bg-slate-50 text-slate-700 border-slate-200' 
    },
  };

  const items = ['YES', 'NO', 'INSUFFICIENT_INFORMATION'].map((key) => {
    const found = data.find(d => d.assessment === key || d.label === key);
    return {
      key,
      count: found ? found.count : 0,
      ...defaultMeta[key]
    };
  });

  const total = items.reduce((sum, it) => sum + it.count, 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center p-6 bg-white/50 backdrop-blur-md rounded-2xl border border-white/80 shadow-xs">
        <p className="text-sm font-bold text-slate-800">No completed AI analyses available.</p>
        <p className="text-xs text-slate-500 mt-1">Assessments will populate once reports are submitted</p>
      </div>
    );
  }

  const maxVal = Math.max(...items.map(it => it.count), 1);

  return (
    <div className="space-y-4 w-full select-none py-1">
      {items.map((item, idx) => {
        const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
        const barWidth = `${(item.count / maxVal) * 100}%`;
        const isHovered = hoveredIdx === idx;

        return (
          <div
            key={item.key}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            className={`p-4 rounded-2xl border backdrop-blur-md transition-all duration-200 cursor-pointer space-y-2.5 ${
              isHovered 
                ? 'bg-white/95 border-slate-400 shadow-md scale-[1.02]' 
                : 'bg-white/60 border-white/80 hover:bg-white/85 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: item.color }} />
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    {item.label}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    {item.desc}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 font-mono">
                <span className="text-xs font-bold text-slate-500">{pct}%</span>
                <span className={`font-black text-sm px-3 py-1 rounded-xl border shadow-2xs ${item.badge}`}>
                  {item.count}
                </span>
              </div>
            </div>

            {/* Glowing Rounded Bar */}
            <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${item.gradient} transition-all duration-500 shadow-xs`}
                style={{
                  width: item.count > 0 ? barWidth : '0%',
                  opacity: isHovered ? 1 : 0.88
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// 4. HIGHLY INTERACTIVE GLASSY COMMON HAZARDS IDENTIFIED BAR CHART
// ============================================================================
export function CommonHazardsBarChart({ data = [] }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center p-6 bg-white/50 backdrop-blur-md rounded-2xl border border-white/80 shadow-xs">
        <p className="text-sm font-bold text-slate-800">No hazards have been identified yet.</p>
        <p className="text-xs text-slate-500 mt-1">Identified hazards from AI analyses will appear here</p>
      </div>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count), 1);
  const gradients = [
    'from-blue-500 to-indigo-500',
    'from-teal-500 to-emerald-400',
    'from-amber-400 to-orange-500',
    'from-violet-500 to-purple-500',
    'from-rose-400 to-pink-500',
    'from-sky-400 to-blue-500',
  ];

  return (
    <div className="space-y-3 w-full select-none py-1">
      {data.map((item, idx) => {
        const grad = gradients[idx % gradients.length];
        const barWidth = `${(item.count / maxCount) * 100}%`;
        const isHovered = hoveredIdx === idx;

        return (
          <div
            key={idx}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            className={`p-3.5 rounded-2xl border backdrop-blur-md transition-all duration-200 cursor-pointer space-y-2 ${
              isHovered 
                ? 'bg-white/95 border-slate-400 shadow-md scale-[1.02]' 
                : 'bg-white/60 border-white/80 hover:bg-white/85 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800 truncate pr-3">
                {item.hazard}
              </span>
              <span className="font-mono font-black text-slate-900 bg-white px-3 py-1 rounded-xl text-xs border border-slate-200 shadow-2xs shrink-0">
                {item.count} report{item.count > 1 ? 's' : ''}
              </span>
            </div>

            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${grad} transition-all duration-500 shadow-xs`}
                style={{
                  width: barWidth,
                  opacity: isHovered ? 1 : 0.85
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// 5. HIGHLY INTERACTIVE GLASSY SAFETY REPORTS BY LOCATION BAR CHART
// ============================================================================
export function LocationBarChart({ data = [] }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-44 text-center p-6 bg-white/50 backdrop-blur-md rounded-2xl border border-white/80 shadow-xs">
        <p className="text-sm font-bold text-slate-800">No location data available yet.</p>
        <p className="text-xs text-slate-500 mt-1">Location observations will populate as reports are submitted</p>
      </div>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count), 1);
  const locationThemes = [
    { grad: 'from-blue-500 to-indigo-600', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
    { grad: 'from-teal-500 to-cyan-500', badge: 'bg-teal-50 text-teal-700 border-teal-200' },
    { grad: 'from-amber-400 to-orange-500', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
    { grad: 'from-purple-500 to-violet-600', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
    { grad: 'from-rose-400 to-pink-500', badge: 'bg-rose-50 text-rose-700 border-rose-200' },
    { grad: 'from-sky-400 to-blue-500', badge: 'bg-sky-50 text-sky-700 border-sky-200' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full select-none py-1">
      {data.map((item, idx) => {
        const theme = locationThemes[idx % locationThemes.length];
        const barWidth = `${(item.count / maxCount) * 100}%`;
        const isHovered = hoveredIdx === idx;

        return (
          <div
            key={idx}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            className={`p-4 rounded-2xl border backdrop-blur-md transition-all duration-200 cursor-pointer space-y-2.5 ${
              isHovered 
                ? 'bg-white/95 border-slate-400 shadow-md scale-[1.02]' 
                : 'bg-white/65 border-white/80 hover:bg-white/85 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`w-3 h-3 rounded-full shrink-0 bg-gradient-to-r ${theme.grad} shadow-xs`} />
                <span className="font-bold text-slate-800 truncate">
                  {item.location}
                </span>
              </div>
              <span className={`font-mono font-black px-3 py-0.5 rounded-xl border text-xs shrink-0 shadow-2xs ${theme.badge}`}>
                {item.count} report{item.count > 1 ? 's' : ''}
              </span>
            </div>

            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${theme.grad} transition-all duration-500 shadow-xs`}
                style={{
                  width: barWidth,
                  opacity: isHovered ? 1 : 0.85
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// BACKWARD COMPATIBILITY EXPORTS
// ============================================================================
export function ColorfulHazardDonut({ data, size = 260 }) {
  return <ReportDistributionDonut data={data} size={size} />;
}

export function SifPieChart({ sifCount = 0, nonSifCount = 0, size = 240 }) {
  return (
    <SifPrecursorHorizontalBarChart
      data={[
        { assessment: 'YES', count: sifCount },
        { assessment: 'NO', count: nonSifCount },
        { assessment: 'INSUFFICIENT_INFORMATION', count: 0 },
      ]}
    />
  );
}

export function ColorfulFacilityBarGraph({ data }) {
  return <LocationBarChart data={data?.map(d => ({ location: d.name, count: d.total })) || []} />;
}

export function ColorfulTrendChart({ data, height = 220 }) {
  return <ReportingTrendLineChart data={data?.map(d => ({ date: d.period || '', count: d.totalReports || 0 })) || []} />;
}

export function SparklineAreaChart({ data }) {
  return <ReportingTrendLineChart data={data} />;
}

export function VerticalBarChart({ data }) {
  return <LocationBarChart data={data} />;
}

export function HorizontalRankingChart({ data }) {
  return <CommonHazardsBarChart data={data} />;
}
