import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Cpu, 
  ShieldAlert, 
  CheckSquare, 
  Building2, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();

  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      subtitle: 'Safety Intelligence Overview', 
      icon: LayoutDashboard 
    },
    { 
      id: 'safety_reports', 
      label: 'Safety Reports', 
      subtitle: 'View & Manage Reports', 
      icon: FileText 
    },
    { 
      id: 'ai_analysis', 
      label: 'AI Analysis', 
      subtitle: 'Explainable AI Results', 
      icon: Cpu 
    },
    { 
      id: 'sif_intelligence', 
      label: 'SIF Intelligence', 
      subtitle: 'Patterns & Safety Signals', 
      icon: ShieldAlert 
    },
    { 
      id: 'review_feedback', 
      label: 'Review & Feedback', 
      subtitle: 'Human-in-the-Loop Review', 
      icon: CheckSquare 
    },
  ];

  const organizationName = user?.organization_name || user?.organization_id || 'Organization';

  return (
    <aside className="w-64 bg-[#0F172A] text-slate-300 flex flex-col justify-between select-none h-screen sticky top-0 border-r border-slate-800 shadow-xl z-40 shrink-0">
      
      {/* Brand & Navigation Header */}
      <div className="flex flex-col min-h-0">
        
        {/* Top Header Logo */}
        <div className="p-5 border-b border-slate-800 bg-[#0B1120]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 shrink-0">
              <ShieldAlert className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="text-base font-extrabold text-white tracking-tight font-heading flex items-center gap-1.5">
                <span>SafetyAI</span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                AI-Powered Safety Intelligence
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Modules (Cleaned — No redundant Submit Safety Report) */}
        <nav className="p-3 space-y-1 mt-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer relative group ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${
                  isActive ? 'bg-white/20 text-white' : 'text-slate-400 group-hover:text-blue-400 group-hover:bg-slate-800'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs truncate">{item.label}</span>
                  </div>
                  <div className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-blue-100 font-normal' : 'text-slate-500'}`}>
                    {item.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer: Organization Profile & Logout */}
      <div className="p-3 border-t border-slate-800 bg-[#0B1120] space-y-2">
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-left">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 text-slate-200 text-xs font-semibold truncate min-w-0">
              <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="truncate">{organizationName}</span>
            </div>
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30 shrink-0">
              Verified
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono truncate">
            {user?.email || 'authenticated'}
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Platform</span>
        </button>
      </div>

    </aside>
  );
}
