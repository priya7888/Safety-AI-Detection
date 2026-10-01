import React from 'react';
import { 
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ROUTE_TITLES = {
  '/dashboard': { title: 'Good morning, Safety Team ☀', subtitle: "Here's today's safety intelligence overview." },
  '/ai-analysis': { title: 'AI Safety Intelligence', subtitle: 'Explainable neural analysis of safety observations & energy vectors.' },
  '/bulk-upload': { title: 'Bulk Safety Ingestion', subtitle: 'Batch upload incident logs, field sheets, and inspection reports.' },
  '/reports': { title: 'All Safety Reports', subtitle: 'Comprehensive database of field observations, near-misses, and unsafe acts.' },
  '/week-signals': { title: 'Weak Signals Intelligence', subtitle: 'Detect emerging weak signals from submitted safety reports and show how multiple minor observations may contribute to a potential SIF precursor.' },
  '/strong-report': { title: 'High-Consequence Reports', subtitle: 'Prioritized critical reports with severe SIF potential.' },
  '/sif-precursors': { title: 'SIF Precursor Intelligence Center', subtitle: '' },
  '/critical-alerts': { title: 'Critical Alert Center', subtitle: 'Immediate high-priority hazard escalations requiring barrier verification.' },
  '/corrective-actions': { title: 'Corrective Actions (CAPA)', subtitle: 'Action tracking, control implementation, and barrier closure verification.' },
  '/analytics': { title: 'Safety Telemetry Analytics', subtitle: 'Cross-facility performance benchmarking and incident trajectory.' },
  '/risk-heatmap': { title: 'Facility Risk Heatmap', subtitle: 'Spatial risk matrix based on API RP 754 hazard exposure zones.' },
  '/life-saving-rules': { title: 'Life-Saving Rules', subtitle: 'IOGP standardized barrier verifications and compliance auditing.' },
  '/settings': { title: 'Platform Settings', subtitle: '' },
};

export default function Header({ 
  currentPath = '/dashboard', 
  onNavigate, 
  onOpenSidebar, 
  onToggleSidebar, 
  isSidebarCollapsed = false, 
  onExitPlatform 
}) {
  const { user, logout } = useAuth();
  const routeMeta = ROUTE_TITLES[currentPath] || ROUTE_TITLES['/dashboard'];

  return (
    <header className="h-16 bg-white border-b border-[#EAE6E1] px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 select-none shadow-[0_1px_4px_rgba(15,23,42,0.03)]">
      
      {/* 1. Left Section: Compact Greeting & Subtitle */}
      <div className="flex items-center gap-3">
        {/* Page Titles: Deep navy font with clean enterprise hierarchy */}
        <div className="text-left">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 font-heading">
              {routeMeta.title}
            </h1>
          </div>
          {routeMeta.subtitle ? (
            <p className="text-[11px] sm:text-xs text-slate-500 font-normal truncate max-w-xs sm:max-w-md md:max-w-lg mt-0.5">
              {routeMeta.subtitle}
            </p>
          ) : null}
        </div>
      </div>

      {/* 2. Right Section: User Identity Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        <button
          onClick={() => onNavigate && onNavigate('/settings')}
          className="flex items-center gap-2.5 p-1.5 px-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left cursor-pointer group border border-slate-200/60"
          title="Account Settings"
        >
          {user?.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.full_name || 'User'} 
              className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-xs ring-2 ring-orange-500/20"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF5A36] to-[#FFA133] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {user?.full_name ? user.full_name.substring(0, 2).toUpperCase() : (user?.is_admin || user?.role === 'ADMINISTRATOR' ? 'AD' : 'NU')}
            </div>
          )}
          <div className="hidden md:block text-left leading-tight">
            <div className="text-xs font-bold text-slate-900 tracking-tight group-hover:text-[#FF5A36] transition-colors">
              {user?.full_name || (user?.is_admin ? 'Chief HSE Administrator' : 'Field Safety Operator')}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              {user?.role_name || (user?.is_admin ? 'Administrator' : 'Normal User')}
            </div>
          </div>
        </button>
      </div>

    </header>
  );
}
