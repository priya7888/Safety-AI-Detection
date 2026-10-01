import React from 'react';
import { Shield } from 'lucide-react';

export default function OrganizationFooter({ onNavigate }) {
  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-[#0a0d14] px-4 sm:px-8 py-3.5 text-xs text-slate-400 select-none">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Left: Organization Branding */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-200">
            <Shield className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
            <span>Safety<span className="text-amber-400">AI</span></span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300 font-medium">Organization Portal</span>
          <span className="text-slate-600 font-mono text-[10px] hidden sm:inline">• OIL-INDIA-HSSE</span>
        </div>

        {/* Right: Operational Status & Support */}
        <div className="flex items-center gap-4 text-[11px]">
          <button 
            onClick={() => onNavigate && onNavigate('settings')} 
            className="hover:text-slate-200 transition-colors cursor-pointer"
          >
            Privacy & Security
          </button>
          <span>•</span>
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>All Systems Operational</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
