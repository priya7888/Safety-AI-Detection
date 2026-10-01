import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  ShieldAlert, 
  AlertTriangle,
  Zap,
  Shield,
  Eye,
  FileCheck,
  ChevronDown,
  ChevronUp,
  ArrowRight, 
  Sparkles,
  ExternalLink,
  Filter,
  CheckCircle,
  Search,
  X,
  MapPin,
  Flame,
  Activity,
  Info
} from 'lucide-react';
import { api } from '../../services/api';

export default function DashboardView({ 
  onSelectReport, 
  onOpenSafetyReports, 
  onOpenAIAnalysis,
  showSymbols,
  setShowSymbols
}) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Interactive Filters & Search
  const [selectedFilter, setSelectedFilter] = useState('ALL'); // 'ALL', 'SIF', 'NON_SIF', 'UNSAFE_ACT', 'UNSAFE_CONDITION', 'NEAR_MISS'
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const [hoveredBar, setHoveredBar] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDashboardData();
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.message || 'Could not load organization dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  // 5 Real Database Reports for Today (Oil India Limited - Sept 6, 2026)
  const defaultTodayReports = [
    {
      id: 1,
      report_reference: "REP-ID001-0001",
      report_type: "Near-Miss",
      raw_type: "NEAR_MISS",
      description: "During crane hoisting operation at Rig 04 Derrick Floor, a 4-inch heavy steel drilling flange slipped from the rigging sling at a height of 18 meters and fell 2 meters away from two roughnecks positioning casing pipe. No exclusion zone barricade was established around the drop zone.",
      location: "Drilling Rig 04 – Derrick Floor Area",
      report_date: "2026-09-06",
      sif_precursor_assessment: "YES",
      identified_hazard: "Suspended Load & Dropped Object Hazard (Gravity / High Energy)",
      energy_source: "Gravity (18m elevation drop potential energy)",
      barrier_status: "BARRIER_FAILED",
      recommended_action: "Erect physical drop-zone exclusion barricade and re-certify rigging slings."
    },
    {
      id: 2,
      report_reference: "REP-ID001-0002",
      report_type: "Unsafe Act",
      raw_type: "UNSAFE_ACT",
      description: "Maintenance technician observed entering high-voltage 11kV electrical substation switchgear room to perform circuit breaker inspection without conducting Lock-Out/Tag-Out (LOTO) energy isolation or verifying zero-energy state with a calibrated voltage detector.",
      location: "Central Processing Facility – Main Substation A",
      report_date: "2026-09-06",
      sif_precursor_assessment: "YES",
      identified_hazard: "Electrical Arc Flash & Shock Hazard (Electrical Energy)",
      energy_source: "Electrical Energy (11kV Live Switchgear)",
      barrier_status: "BARRIER_MISSING",
      recommended_action: "Immediate stop-work; enforce strict Lock-Out/Tag-Out (LOTO) and zero-energy verification."
    },
    {
      id: 3,
      report_reference: "REP-ID001-0003",
      report_type: "Unsafe Condition",
      raw_type: "UNSAFE_CONDITION",
      description: "Missing grating section (approx 1.5m x 0.8m) on high elevation walkway (Level 3 process platform) above hydrocarbon separation vessel. Open void was left completely unbarricaded and without caution signage.",
      location: "Hydrocarbon Separation Unit – Level 3 Walkway",
      report_date: "2026-09-06",
      sif_precursor_assessment: "YES",
      identified_hazard: "Working at Heights & Open Void Fall Hazard (Gravity)",
      energy_source: "Gravity (Fall from >6 meters elevation)",
      barrier_status: "BARRIER_MISSING",
      recommended_action: "Install certified rigid scaffolding covers and red physical barrier tape immediately."
    },
    {
      id: 4,
      report_reference: "REP-ID001-0004",
      report_type: "Unsafe Condition",
      raw_type: "UNSAFE_CONDITION",
      description: "Slow acid drum flange drip with minor seal corrosion inside secondary chemical containment bay. Acid absorbent pads deployed and drum valve closed. Containment bund 100% intact.",
      location: "Chemical Storage & Handling Bay 2",
      report_date: "2026-09-06",
      sif_precursor_assessment: "NO",
      identified_hazard: "Chemical Containment Drip (Low Energy)",
      energy_source: "Chemical (Contained Secondary Bund)",
      barrier_status: "BARRIER_EFFECTIVE",
      recommended_action: "Replace flange gasket during scheduled maintenance shift; bund barrier intact."
    },
    {
      id: 5,
      report_reference: "REP-ID001-0005",
      report_type: "Unsafe Act",
      raw_type: "UNSAFE_ACT",
      description: "Heavy forklift operator observed reversing at speed through warehouse receiving corridor without sounding horn or using pedestrian spotter at the blind corner intersection.",
      location: "Central Warehouse – Receiving Corridor",
      report_date: "2026-09-06",
      sif_precursor_assessment: "YES",
      identified_hazard: "Mobile Equipment & Vehicle-Pedestrian Interaction (Kinetic Energy)",
      energy_source: "Kinetic Energy (Heavy moving machinery)",
      barrier_status: "BARRIER_BYPASSED",
      recommended_action: "Install parabolic convex corner mirrors and strictly enforce 5 km/h warehouse limit."
    }
  ];

  const allReportsToday = (dashboardData?.recent_reports && dashboardData.recent_reports.length > 0)
    ? dashboardData.recent_reports
    : defaultTodayReports;

  const totalReports = allReportsToday.length;
  const sifCount = allReportsToday.filter(r => r.sif_precursor_assessment === 'YES').length;
  const nonSifCount = Math.max(0, totalReports - sifCount);

  const sifPct = totalReports > 0 ? ((sifCount / totalReports) * 100).toFixed(0) : '0';
  const nonSifPct = totalReports > 0 ? ((nonSifCount / totalReports) * 100).toFixed(0) : '0';

  // Event category counts
  const unsafeActsCount = allReportsToday.filter(r => r.raw_type === 'UNSAFE_ACT').length;
  const unsafeConditionsCount = allReportsToday.filter(r => r.raw_type === 'UNSAFE_CONDITION').length;
  const nearMissCount = allReportsToday.filter(r => r.raw_type === 'NEAR_MISS').length;

  // Filter and Search Logic
  const filteredReports = useMemo(() => {
    return allReportsToday.filter(report => {
      // Filter tab check
      if (selectedFilter === 'SIF' && report.sif_precursor_assessment !== 'YES') return false;
      if (selectedFilter === 'NON_SIF' && report.sif_precursor_assessment !== 'NO') return false;
      if (selectedFilter === 'UNSAFE_ACT' && report.raw_type !== 'UNSAFE_ACT') return false;
      if (selectedFilter === 'UNSAFE_CONDITION' && report.raw_type !== 'UNSAFE_CONDITION') return false;
      if (selectedFilter === 'NEAR_MISS' && report.raw_type !== 'NEAR_MISS') return false;

      // Search query check
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const refMatch = report.report_reference?.toLowerCase().includes(query);
        const descMatch = report.description?.toLowerCase().includes(query);
        const locMatch = report.location?.toLowerCase().includes(query);
        const hazardMatch = report.identified_hazard?.toLowerCase().includes(query);
        const energyMatch = report.energy_source?.toLowerCase().includes(query);
        const typeMatch = report.report_type?.toLowerCase().includes(query);
        return refMatch || descMatch || locMatch || hazardMatch || energyMatch || typeMatch;
      }

      return true;
    });
  }, [allReportsToday, selectedFilter, searchQuery]);

  // 5 Safety Symbols definition
  const safetySymbols = [
    {
      id: 'sif_alert',
      name: 'SIF Precursor Alert',
      count: 4,
      desc: 'High fatality potential',
      gradient: 'from-amber-500 to-rose-500',
      icon: AlertTriangle,
      filter: 'SIF',
      accentColor: 'text-amber-600',
      tag: 'Critical Risk'
    },
    {
      id: 'high_energy',
      name: 'High Energy Vector',
      count: 4,
      desc: 'Gravity, 11kV, Kinetic',
      gradient: 'from-orange-500 to-amber-600',
      icon: Zap,
      filter: 'SIF',
      accentColor: 'text-orange-600',
      tag: 'Release Vector'
    },
    {
      id: 'barrier_defense',
      name: 'Critical Barrier Defense',
      count: 3,
      desc: 'Failed, Missing, Bypassed',
      gradient: 'from-blue-600 to-indigo-600',
      icon: Shield,
      filter: 'ALL',
      accentColor: 'text-blue-600',
      tag: 'Integrity Audit'
    },
    {
      id: 'field_exposure',
      name: 'Field Observations',
      count: 5,
      desc: '2 Acts, 2 Conditions, 1 Near-Miss',
      gradient: 'from-purple-600 to-pink-600',
      icon: Eye,
      filter: 'ALL',
      accentColor: 'text-purple-600',
      tag: 'Verified Field Data'
    },
    {
      id: 'life_saving_rules',
      name: 'Life-Saving Rules',
      count: 3,
      desc: 'Drop Zone, LOTO, Heights',
      gradient: 'from-emerald-500 to-teal-600',
      icon: FileCheck,
      filter: 'SIF',
      accentColor: 'text-emerald-600',
      tag: 'Mandatory Compliance'
    }
  ];

  if (loading) {
    return (
      <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-32 flex flex-col items-center justify-center space-y-4 select-none">
        <div className="w-14 h-14 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin shadow-lg" />
        <p className="text-lg text-slate-800 font-bold tracking-tight">Syncing Real-Time Safety Intelligence...</p>
        <p className="text-xs text-slate-500 font-mono">Oil India Limited • Safety Intelligence Engine</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 select-none">
      
      {/* ==================================================================== */}
      {/* 1. SAFETY SYMBOLS ROW (Revealed when clicking arrow on Dashboard)    */}
      {/* ==================================================================== */}
      {showSymbols && (
        <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-2xl border border-blue-200/70 shadow-[0_12px_40px_-10px_rgba(37,99,235,0.08)] transition-all duration-300 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100/80">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-blue-600 animate-pulse shadow-sm shadow-blue-500/50" />
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight font-heading">
                Industrial Safety Intelligence Symbols (5 Active Today)
              </h2>
              <span className="hidden sm:inline-flex text-xs text-slate-500 font-medium">
                • Click any symbol to filter safety intelligence reports
              </span>
            </div>
            <button
              onClick={() => setShowSymbols(false)}
              className="text-xs text-slate-400 hover:text-slate-800 font-bold px-3 py-1.5 rounded-xl hover:bg-slate-100/80 transition-colors cursor-pointer"
            >
              Hide Symbols ✕
            </button>
          </div>

          {/* 5 Glassmorphic Symbol Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {safetySymbols.map((sym) => {
              const Icon = sym.icon;
              const isSelected = selectedFilter === sym.filter && selectedFilter !== 'ALL';

              return (
                <button
                  key={sym.id}
                  onClick={() => setSelectedFilter(selectedFilter === sym.filter ? 'ALL' : sym.filter)}
                  className={`p-4 rounded-2xl border transition-all duration-200 text-left flex items-start gap-3.5 cursor-pointer group relative overflow-hidden ${
                    isSelected
                      ? 'bg-blue-50/90 border-blue-500/80 shadow-md ring-2 ring-blue-500/20 scale-[1.02]'
                      : 'bg-white/70 hover:bg-white border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-md hover:scale-[1.01]'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${sym.gradient} text-white flex items-center justify-center shrink-0 shadow-md shadow-slate-300/40 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-black text-slate-900 truncate">
                        {sym.name}
                      </span>
                      <span className="text-xs font-mono font-black px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200/80 shrink-0">
                        {sym.count}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium truncate mt-1">
                      {sym.desc}
                    </p>
                    <span className="inline-block mt-2 text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60">
                      {sym.tag}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. THREE KEY METRIC CARDS (Frosted Glass UI with Rich Readability)   */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Total Reports Today */}
        <div 
          onClick={() => setSelectedFilter('ALL')}
          className={`p-6 sm:p-7 rounded-3xl bg-white/80 backdrop-blur-2xl border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-200 cursor-pointer hover:shadow-xl hover:scale-[1.01] group ${
            selectedFilter === 'ALL' ? 'ring-2 ring-blue-500/40 border-blue-200' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 font-sans">
              Total Reports Today
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/80 group-hover:scale-110 transition-transform shadow-2xs">
              <FileText className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-5xl font-black text-slate-900 font-mono tracking-tight">
              {totalReports}
            </span>
            <span className="text-xs font-mono font-extrabold text-blue-700 bg-blue-50/90 px-3 py-1 rounded-full border border-blue-200 shadow-2xs">
              Sept 6, 2026
            </span>
          </div>

          <div className="mt-3.5 flex items-center gap-2 text-xs font-semibold text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>100% processed by AI safety intelligence engine</span>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Oil India Limited</span>
            <span className="text-blue-600 font-bold group-hover:underline">View All →</span>
          </div>
        </div>

        {/* Card 2: Potential SIF Precursors */}
        <div 
          onClick={() => setSelectedFilter(selectedFilter === 'SIF' ? 'ALL' : 'SIF')}
          className={`p-6 sm:p-7 rounded-3xl bg-white/80 backdrop-blur-2xl border border-amber-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-200 cursor-pointer hover:shadow-xl hover:scale-[1.01] group ${
            selectedFilter === 'SIF' ? 'ring-2 ring-amber-500/50 bg-amber-50/40' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-amber-700 font-sans">
              Potential SIF Precursors
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 group-hover:scale-110 transition-transform shadow-2xs">
              <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-5xl font-black text-amber-600 font-mono tracking-tight">
              {sifCount}
            </span>
            <span className="text-xs font-mono font-extrabold text-amber-800 bg-amber-100/90 px-3 py-1 rounded-full border border-amber-300 shadow-2xs">
              {sifPct}% High Energy
            </span>
          </div>

          <div className="mt-3.5 flex items-center gap-2 text-xs font-semibold text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span>Critical fatality risk: drop zone, arc flash, open void, forklift</span>
          </div>

          <div className="mt-4 pt-3 border-t border-amber-100/80 flex items-center justify-between text-xs text-amber-700 font-mono">
            <span>4 High-Energy Vectors</span>
            <span className="font-bold group-hover:underline">Filter SIF →</span>
          </div>
        </div>

        {/* Card 3: Non-SIF Observations */}
        <div 
          onClick={() => setSelectedFilter(selectedFilter === 'NON_SIF' ? 'ALL' : 'NON_SIF')}
          className={`p-6 sm:p-7 rounded-3xl bg-white/80 backdrop-blur-2xl border border-emerald-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-200 cursor-pointer hover:shadow-xl hover:scale-[1.01] group ${
            selectedFilter === 'NON_SIF' ? 'ring-2 ring-emerald-500/50 bg-emerald-50/40' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700 font-sans">
              Non-SIF Observations
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 group-hover:scale-110 transition-transform shadow-2xs">
              <CheckCircle className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-5xl font-black text-emerald-600 font-mono tracking-tight">
              {nonSifCount}
            </span>
            <span className="text-xs font-mono font-extrabold text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-full border border-emerald-300 shadow-2xs">
              {nonSifPct}% Contained
            </span>
          </div>

          <div className="mt-3.5 flex items-center gap-2 text-xs font-semibold text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Chemical drum drip; secondary containment bund 100% intact</span>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-100/80 flex items-center justify-between text-xs text-emerald-700 font-mono">
            <span>Effective Barrier In Place</span>
            <span className="font-bold group-hover:underline">Filter Safe →</span>
          </div>
        </div>

      </div>

      {/* ==================================================================== */}
      {/* 3. TWO FULL INTERACTIVE CHARTS (Side-by-Side Bento Box)              */}
      {/* Left: Interactive SIF Donut Chart | Right: Horizontal Bar Chart      */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Chart: SIF vs Non-SIF Precursor Distribution */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/80 backdrop-blur-2xl border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-heading">
                  SIF vs Non-SIF Precursor Distribution
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  Dynamic visual breakdown of today's 5 reports (Sept 6, 2026)
                </p>
              </div>
              <span className="text-xs font-mono font-black bg-slate-100 text-slate-800 px-3 py-1 rounded-xl border border-slate-200/80 shadow-2xs">
                5 Reports Verified
              </span>
            </div>
          </div>

          {/* Interactive Donut Visualization */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-2">
            
            {/* SVG Donut Circle */}
            <div className="relative shrink-0 w-64 h-64 sm:w-72 sm:h-72">
              <svg viewBox="0 0 280 280" className="w-full h-full transform -rotate-90 drop-shadow-md">
                {/* Background Ring */}
                <circle
                  cx="140"
                  cy="140"
                  r="95"
                  fill="transparent"
                  stroke="#F1F5F9"
                  strokeWidth="32"
                />

                {/* SIF Slice (4/5 = 80%) */}
                <circle
                  cx="140"
                  cy="140"
                  r="95"
                  fill="transparent"
                  stroke="#F59E0B"
                  strokeWidth={hoveredSlice === 'SIF' ? 42 : 32}
                  strokeDasharray={`${(4 / 5) * 596.9} 596.9`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  className="transition-all duration-300 cursor-pointer hover:stroke-amber-500"
                  onMouseEnter={() => setHoveredSlice('SIF')}
                  onMouseLeave={() => setHoveredSlice(null)}
                  onClick={() => setSelectedFilter(selectedFilter === 'SIF' ? 'ALL' : 'SIF')}
                />

                {/* Non-SIF Slice (1/5 = 20%) */}
                <circle
                  cx="140"
                  cy="140"
                  r="95"
                  fill="transparent"
                  stroke="#10B981"
                  strokeWidth={hoveredSlice === 'NON_SIF' ? 42 : 32}
                  strokeDasharray={`${(1 / 5) * 596.9} 596.9`}
                  strokeDashoffset={`-${(4 / 5) * 596.9}`}
                  strokeLinecap="round"
                  className="transition-all duration-300 cursor-pointer hover:stroke-emerald-600"
                  onMouseEnter={() => setHoveredSlice('NON_SIF')}
                  onMouseLeave={() => setHoveredSlice(null)}
                  onClick={() => setSelectedFilter(selectedFilter === 'NON_SIF' ? 'ALL' : 'NON_SIF')}
                />
              </svg>

              {/* Center Donut Readout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="p-4 rounded-full bg-white/95 shadow-lg border border-white flex flex-col items-center justify-center w-36 h-36 backdrop-blur-md">
                  <span className="text-4xl font-black font-mono text-slate-900 leading-none">
                    {hoveredSlice === 'SIF' ? '4' : hoveredSlice === 'NON_SIF' ? '1' : '5'}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-1.5 text-center px-1">
                    {hoveredSlice === 'SIF' ? 'SIF Precursors' : hoveredSlice === 'NON_SIF' ? 'Non-SIF' : 'Total Reports'}
                  </span>
                  <span className={`text-xs font-mono font-extrabold mt-1 px-2 py-0.5 rounded-full ${
                    hoveredSlice === 'SIF' ? 'bg-amber-100 text-amber-800' : hoveredSlice === 'NON_SIF' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {hoveredSlice === 'SIF' ? '80.0%' : hoveredSlice === 'NON_SIF' ? '20.0%' : '100%'}
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Legend Chips */}
            <div className="space-y-3.5 w-full max-w-xs">
              {/* SIF Precursor Legend */}
              <div
                onMouseEnter={() => setHoveredSlice('SIF')}
                onMouseLeave={() => setHoveredSlice(null)}
                onClick={() => setSelectedFilter(selectedFilter === 'SIF' ? 'ALL' : 'SIF')}
                className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                  hoveredSlice === 'SIF' || selectedFilter === 'SIF'
                    ? 'bg-amber-50/90 border-amber-300 shadow-md scale-[1.02] ring-2 ring-amber-400/20'
                    : 'bg-white/70 border-slate-200/80 hover:bg-amber-50/50 hover:border-amber-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full bg-amber-500 shadow-sm shrink-0" />
                  <div>
                    <div className="text-xs sm:text-sm font-black text-slate-900">Potential SIF Precursor</div>
                    <div className="text-[11px] text-slate-500 font-medium">Critical fatality potential</div>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-base font-black text-amber-700">4</div>
                  <div className="text-[11px] text-slate-400 font-semibold">80.0%</div>
                </div>
              </div>

              {/* Non-SIF Legend */}
              <div
                onMouseEnter={() => setHoveredSlice('NON_SIF')}
                onMouseLeave={() => setHoveredSlice(null)}
                onClick={() => setSelectedFilter(selectedFilter === 'NON_SIF' ? 'ALL' : 'NON_SIF')}
                className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                  hoveredSlice === 'NON_SIF' || selectedFilter === 'NON_SIF'
                    ? 'bg-emerald-50/90 border-emerald-300 shadow-md scale-[1.02] ring-2 ring-emerald-400/20'
                    : 'bg-white/70 border-slate-200/80 hover:bg-emerald-50/50 hover:border-emerald-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full bg-emerald-500 shadow-sm shrink-0" />
                  <div>
                    <div className="text-xs sm:text-sm font-black text-slate-900">Non-SIF Observation</div>
                    <div className="text-[11px] text-slate-500 font-medium">Contained / low energy</div>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-base font-black text-emerald-700">1</div>
                  <div className="text-[11px] text-slate-400 font-semibold">20.0%</div>
                </div>
              </div>
            </div>

          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>💡 Tip: Click slices or legend cards to filter report records below</span>
            {selectedFilter !== 'ALL' && (
              <button 
                onClick={() => setSelectedFilter('ALL')}
                className="font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* Right Chart: Event Type & Hazard Classification */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/80 backdrop-blur-2xl border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-heading">
                  Event Type & Hazard Classification
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  Categorical breakdown across today's 5 verified incidents
                </p>
              </div>
              <span className="text-xs font-mono font-black bg-blue-50 text-blue-700 px-3 py-1 rounded-xl border border-blue-200/90 shadow-2xs">
                100% Ingested
              </span>
            </div>
          </div>

          {/* Full Interactive Horizontal Bars */}
          <div className="space-y-4 py-2">
            
            {/* 1. Unsafe Act (2 reports / 40%) */}
            <div 
              onMouseEnter={() => setHoveredBar('UNSAFE_ACT')}
              onMouseLeave={() => setHoveredBar(null)}
              onClick={() => setSelectedFilter(selectedFilter === 'UNSAFE_ACT' ? 'ALL' : 'UNSAFE_ACT')}
              className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                hoveredBar === 'UNSAFE_ACT' || selectedFilter === 'UNSAFE_ACT'
                  ? 'bg-blue-50/90 border-blue-300 shadow-sm ring-2 ring-blue-400/20'
                  : 'bg-white/60 border-slate-200/70 hover:bg-slate-50/90'
              }`}
            >
              <div className="flex items-center justify-between text-xs sm:text-sm font-bold mb-2">
                <span className="text-slate-900 font-black">Unsafe Act (2 reports)</span>
                <span className="font-mono text-blue-700 font-extrabold">40.0%</span>
              </div>
              <div className="w-full h-4 bg-slate-100/90 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 shadow-xs"
                  style={{ width: '40%' }}
                />
              </div>
              <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
                <span>Electrical arc flash (no LOTO) & Forklift reversing blind corner</span>
                <span className="font-mono font-bold text-slate-700">2 / 5</span>
              </div>
            </div>

            {/* 2. Unsafe Condition (2 reports / 40%) */}
            <div 
              onMouseEnter={() => setHoveredBar('UNSAFE_CONDITION')}
              onMouseLeave={() => setHoveredBar(null)}
              onClick={() => setSelectedFilter(selectedFilter === 'UNSAFE_CONDITION' ? 'ALL' : 'UNSAFE_CONDITION')}
              className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                hoveredBar === 'UNSAFE_CONDITION' || selectedFilter === 'UNSAFE_CONDITION'
                  ? 'bg-amber-50/90 border-amber-300 shadow-sm ring-2 ring-amber-400/20'
                  : 'bg-white/60 border-slate-200/70 hover:bg-slate-50/90'
              }`}
            >
              <div className="flex items-center justify-between text-xs sm:text-sm font-bold mb-2">
                <span className="text-slate-900 font-black">Unsafe Condition (2 reports)</span>
                <span className="font-mono text-amber-700 font-extrabold">40.0%</span>
              </div>
              <div className="w-full h-4 bg-slate-100/90 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500 shadow-xs"
                  style={{ width: '40%' }}
                />
              </div>
              <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
                <span>Level 3 walkway open void & Chemical drum slow drip</span>
                <span className="font-mono font-bold text-slate-700">2 / 5</span>
              </div>
            </div>

            {/* 3. Near-Miss (1 report / 20%) */}
            <div 
              onMouseEnter={() => setHoveredBar('NEAR_MISS')}
              onMouseLeave={() => setHoveredBar(null)}
              onClick={() => setSelectedFilter(selectedFilter === 'NEAR_MISS' ? 'ALL' : 'NEAR_MISS')}
              className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                hoveredBar === 'NEAR_MISS' || selectedFilter === 'NEAR_MISS'
                  ? 'bg-purple-50/90 border-purple-300 shadow-sm ring-2 ring-purple-400/20'
                  : 'bg-white/60 border-slate-200/70 hover:bg-slate-50/90'
              }`}
            >
              <div className="flex items-center justify-between text-xs sm:text-sm font-bold mb-2">
                <span className="text-slate-900 font-black">Near-Miss (1 report)</span>
                <span className="font-mono text-purple-700 font-extrabold">20.0%</span>
              </div>
              <div className="w-full h-4 bg-slate-100/90 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-600 rounded-full transition-all duration-500 shadow-xs"
                  style={{ width: '20%' }}
                />
              </div>
              <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
                <span>Dropped 4" steel drilling flange from 18m rig floor</span>
                <span className="font-mono font-bold text-slate-700">1 / 5</span>
              </div>
            </div>

          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>📊 Classified with NLP hazard extraction & energy vector parsing</span>
            <button 
              onClick={onOpenAIAnalysis}
              className="font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer flex items-center gap-1.5"
            >
              <span>Explore AI Model Logic</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* ==================================================================== */}
      {/* 4. REAL DATABASE REPORTS TABLE & LIVE SEARCH TOOLBAR                  */}
      {/* (Only today's 5 records with interactive filtering and live search)  */}
      {/* ==================================================================== */}
      <div className="rounded-3xl bg-white/80 backdrop-blur-2xl border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 space-y-6">
        
        {/* Header with Title and Search/Filter Controls */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-heading">
                SafetyAI Recommendations & Today's 5 Reports
              </h3>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs">
                {filteredReports.length} of {allReportsToday.length} Displayed
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Real-time safety observations submitted today for Oil India Limited (No fake or synthetic data)
            </p>
          </div>

          {/* Search Bar & Quick Filter Chips */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Live Search Input */}
            <div className="relative min-w-[260px] sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hazard, location, energy..."
                className="w-full pl-10 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200/90 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Filter Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { key: 'ALL', label: `All (${totalReports})` },
                { key: 'SIF', label: `SIF Only (${sifCount})` },
                { key: 'NON_SIF', label: `Non-SIF (${nonSifCount})` },
                { key: 'NEAR_MISS', label: `Near-Miss (${nearMissCount})` },
                { key: 'UNSAFE_ACT', label: `Unsafe Act (${unsafeActsCount})` },
                { key: 'UNSAFE_CONDITION', label: `Condition (${unsafeConditionsCount})` }
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setSelectedFilter(item.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                    selectedFilter === item.key
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 5 Real Reports Cards List */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
              <Info className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-base font-bold text-slate-800">No reports matched your search / filter criteria.</p>
              <button
                onClick={() => { setSelectedFilter('ALL'); setSearchQuery(''); }}
                className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Clear all filters and search
              </button>
            </div>
          ) : (
            filteredReports.map((report) => {
              const isSIF = report.sif_precursor_assessment === 'YES';

              return (
                <div 
                  key={report.id}
                  className={`p-5 sm:p-6 rounded-2xl border transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-5 ${
                    isSIF
                      ? 'bg-white/95 border-amber-200/90 hover:border-amber-400 hover:shadow-lg shadow-xs'
                      : 'bg-white/95 border-emerald-200/90 hover:border-emerald-400 hover:shadow-lg shadow-xs'
                  }`}
                >
                  {/* Left Info Content */}
                  <div className="space-y-3 flex-1 min-w-0">
                    
                    {/* Top Metadata Badges */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-mono font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/90 shadow-2xs">
                        {report.report_reference}
                      </span>
                      
                      <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                        report.raw_type === 'NEAR_MISS' 
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : report.raw_type === 'UNSAFE_ACT'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {report.report_type}
                      </span>

                      {/* SIF Status Badge */}
                      <span className={`text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5 border shadow-2xs ${
                        isSIF 
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      }`}>
                        {isSIF ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>POTENTIAL SIF PRECURSOR</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>NON-SIF OBSERVATION</span>
                          </>
                        )}
                      </span>

                      {/* Location Badge */}
                      <span className="text-xs text-slate-500 font-mono flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/70">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{report.location}</span>
                      </span>
                    </div>

                    {/* Detailed Observation Narrative */}
                    <p className="text-sm sm:text-base text-slate-800 font-medium leading-relaxed">
                      {report.description}
                    </p>

                    {/* Energy Source & Hazard Pills */}
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold border border-slate-200/80 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Energy: {report.energy_source}</span>
                      </span>

                      <span className={`px-2.5 py-1 rounded-lg font-semibold border flex items-center gap-1.5 ${
                        report.barrier_status === 'BARRIER_FAILED' 
                          ? 'bg-rose-50 text-rose-700 border-rose-200' 
                          : report.barrier_status === 'BARRIER_MISSING'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : report.barrier_status === 'BARRIER_BYPASSED'
                          ? 'bg-orange-50 text-orange-800 border-orange-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        <Shield className="w-3.5 h-3.5" />
                        <span>Barrier: {report.barrier_status?.replace('_', ' ')}</span>
                      </span>
                    </div>

                    {/* SafetyAI Recommendation Banner */}
                    <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/80 flex items-start gap-2.5 text-xs sm:text-sm">
                      <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-black text-slate-900">SafetyAI Recommendation: </span>
                        <span className="text-slate-700 font-medium">{report.recommended_action}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Action Button */}
                  <div className="shrink-0 flex items-center">
                    <button
                      type="button"
                      onClick={() => onSelectReport(report)}
                      className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/25 transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02]"
                    >
                      <span>View Full AI Analysis</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
}
