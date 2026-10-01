import React from 'react';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Cpu, 
  UploadCloud, 
  FileText, 
  Activity, 
  ChevronDown, 
  ChevronUp, 
  Building2, 
  LogOut,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function TopNavbar({ 
  activeTab, 
  setActiveTab, 
  showSymbols, 
  setShowSymbols 
}) {
  const { user, logout } = useAuth();
  const organizationName = user?.organization_name || user?.organization_id || 'Oil India Limited';

  const navTabs = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      hasArrow: true
    },
    { 
      id: 'ai_analysis', 
      label: 'AI Analysis', 
      icon: Cpu 
    },
    { 
      id: 'bulk_upload', 
      label: 'Bulk Upload', 
      icon: UploadCloud 
    },
    { 
      id: 'all_reports', 
      label: 'All Reports', 
      icon: FileText 
    },
    { 
      id: 'weak_signals', 
      label: 'Weak Signals & Strong Report', 
      icon: Activity 
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-200/70 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] select-none transition-all duration-300">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-3 sm:gap-6">
          
          {/* 1. Brand Logo & Product Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-blue-500/25 ring-2 ring-white/80">
              <ShieldAlert className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-slate-900 tracking-tight font-heading">
                  SafetyAI
                </span>
                <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-bold bg-blue-50/90 text-blue-700 rounded-full border border-blue-200/90 shadow-2xs">
                  SIH PS 165
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium hidden md:block">
                AI SIF Precursor Detection & Intelligence
              </div>
            </div>
          </div>

          {/* 2. Primary Navigation Tabs */}
          <nav className="flex items-center gap-1.5 overflow-x-auto py-1.5 scrollbar-none">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <div key={tab.id} className="relative flex items-center shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25 ring-2 ring-blue-500/20'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{tab.label}</span>
                  </button>

                  {/* Arrow next to Dashboard for Toggling 5 Safety Symbols */}
                  {tab.hasArrow && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (activeTab !== 'dashboard') setActiveTab('dashboard');
                        setShowSymbols(prev => !prev);
                      }}
                      title={showSymbols ? "Hide 5 Safety Symbols" : "Show 5 Safety Symbols"}
                      className={`ml-1 px-2 py-1.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-1 text-xs font-bold ${
                        showSymbols
                          ? 'bg-blue-100/90 text-blue-800 border-blue-300 ring-2 ring-blue-400/30 shadow-xs'
                          : 'bg-white/90 text-slate-600 border-slate-200/90 hover:bg-slate-100/90 hover:text-slate-900 shadow-2xs'
                      }`}
                    >
                      <span className="hidden xl:inline text-[11px] font-mono font-medium">Symbols</span>
                      {showSymbols ? (
                        <ChevronUp className="w-3.5 h-3.5 stroke-[2.5]" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </nav>

          {/* 3. Live Synchronized Date & Organization Profile */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Live Today Sync Badge */}
            <div className="hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/90 border border-slate-200/80 shadow-2xs text-xs font-mono text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-semibold text-slate-800">Sept 6, 2026</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-emerald-700">5 Live Reports</span>
            </div>

            {/* Profile Avatar & Details */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200/80">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs ring-2 ring-blue-500/20">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'O'}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-extrabold text-slate-900 leading-tight">
                  {user?.full_name || 'HSE Lead Officer'}
                </div>
                <div className="text-[11px] text-slate-500 font-medium truncate max-w-[140px] leading-tight mt-0.5">
                  {organizationName}
                </div>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={logout}
                title="Log out of SafetyAI"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50/80 rounded-xl transition-all duration-150 cursor-pointer ml-1 border border-transparent hover:border-rose-200"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
