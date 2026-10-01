import React from 'react';
import { 
  Home, 
  FileText, 
  ShieldAlert, 
  ShieldCheck, 
  TrendingUp, 
  Settings, 
  LogOut, 
  Shield
} from 'lucide-react';

export default function OrganizationSidebar({ activeTab, onSelectTab, onLogout }) {
  const primaryNavItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'safety_reports', label: 'Safety Reports', icon: FileText },
    { id: 'sif_intelligence', label: 'SIF Intelligence', icon: ShieldAlert },
    { id: 'critical_controls', label: 'Critical Controls', icon: ShieldCheck },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  ];

  const secondaryNavItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0c1017] text-slate-300 flex flex-col justify-between select-none h-screen sticky top-0 border-r border-slate-800/80 shadow-2xl z-40 shrink-0">
      
      {/* Top Section: Logo + Org Badge + Navigation */}
      <div className="flex flex-col min-h-0 overflow-y-auto">
        
        {/* Brand Logo Header */}
        <div className="p-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/25 shrink-0">
              <Shield className="w-5 h-5 fill-slate-950/20 stroke-slate-950 stroke-2" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-lg font-bold tracking-tight font-heading text-white flex items-center leading-none">
                Safety<span className="text-amber-400">AI</span>
              </span>
              <span className="text-[9px] font-mono tracking-wider uppercase mt-1 font-semibold text-slate-400 leading-none">
                ENTERPRISE HSE PORTAL
              </span>
            </div>
          </div>
        </div>

        {/* Organization Badge Unit */}
        <div className="mx-4 mb-3 px-3.5 py-2.5 rounded-xl bg-[#111724] border border-white/[0.06] flex items-center gap-3 shadow-inner">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <svg className="w-4 h-4 fill-amber-400" viewBox="0 0 24 24">
              <path d="M4 22V6l6-4v20H4zm8 0V10l6-4v16h-6zm8 0v-8l2-1.5V22h-2z" opacity="0.9" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-white tracking-wide truncate">
              OIL-INDIA-HSSE
            </div>
            <div className="text-[10px] text-slate-400 font-medium truncate">
              Operational Command
            </div>
          </div>
        </div>

        {/* Primary Operations Navigation */}
        <div className="px-3">
          <span className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-1.5">
            Operations
          </span>
          <nav className="space-y-1">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-lg shadow-amber-500/25'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 font-medium'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950 stroke-[2.5]' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span className="text-xs tracking-wide">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Secondary Navigation: Organization & Governance */}
        <div className="px-3 mt-4 pt-3.5 border-t border-white/[0.06]">
          <span className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-1.5">
            Organization & Governance
          </span>
          <nav className="space-y-1">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-lg shadow-amber-500/25'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 font-medium'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950 stroke-[2.5]' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span className="text-xs tracking-wide">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

      </div>

      {/* Bottom Section: Sign Out Button */}
      <div className="p-3 border-t border-white/[0.06]">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all cursor-pointer group"
        >
          <LogOut className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
          <span>Sign Out</span>
        </button>
      </div>

    </aside>
  );
}
