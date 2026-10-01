import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { user } = useAuth();
  const organizationName = user?.organization_name || user?.organization_id || 'Organization';
  const initial = user?.full_name ? user.full_name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'O');

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/70 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs transition-all">
      
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-base font-bold text-slate-900 font-heading tracking-tight">
          Safety Intelligence Dashboard
        </h1>
        <p className="text-xs text-slate-500 hidden sm:block">
          AI-powered analysis of your organization's safety reports.
        </p>
      </div>

      {/* Right Controls: Organization Profile Avatar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 p-1.5 px-2.5 rounded-xl bg-slate-50/80 border border-slate-200/60 shadow-2xs">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {initial}
          </div>
          <div className="hidden md:block text-left leading-tight">
            <div className="text-xs font-bold text-slate-900">
              {user?.full_name || 'HSE Officer'}
            </div>
            <div className="text-[10px] text-slate-500 font-mono truncate max-w-[180px]">
              {organizationName}
            </div>
          </div>
        </div>
      </div>

    </header>
  );
}
