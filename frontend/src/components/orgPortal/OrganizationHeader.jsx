import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  ChevronDown, 
  User, 
  Building2, 
  LogOut, 
  ShieldCheck, 
  AlertTriangle,
  FileText,
  Activity,
  Shield
} from 'lucide-react';

export default function OrganizationHeader({ 
  user, 
  onLogout, 
  onNavigate
}) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState({
    date: 'Sat, 06 Sep 2026',
    time: '10:24 AM'
  });

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Dynamic Live Time updating
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      setCurrentTime({ date: dateStr, time: timeStr });
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, title: 'Unusual vibration in compressor', time: '12m ago', isSif: true },
    { id: 2, title: 'Hydrocarbon leak near flange - Rig 04', time: '1h ago', isSif: true },
    { id: 3, title: 'Safety Interlock bypass detected', time: '2h ago', isSif: true },
    { id: 4, title: 'LOTO audit due at Duliajan Substation', time: '4h ago', isSif: false },
    { id: 5, title: 'Secondary chemical bund drain alert', time: '5h ago', isSif: true },
    { id: 6, title: 'Daily shift safety compliance logged (98%)', time: '7h ago', isSif: false },
    { id: 7, title: 'Drop-zone exclusion barrier verified', time: '8h ago', isSif: false },
    { id: 8, title: 'HSE Monthly Risk Summary ready', time: '1d ago', isSif: false }
  ];

  return (
    <header className="h-[68px] bg-[#0c1017]/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 select-none">
      
      {/* Left: Organization Enterprise Identity & Operational Command Status */}
      <div className="flex items-center gap-3.5">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <Building2 className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-white tracking-tight font-heading">
              Oil India Limited
            </span>
            <span className="hidden sm:inline-block text-slate-600 font-mono text-xs">/</span>
            <span className="hidden sm:inline-block text-[11px] font-mono text-slate-400 font-medium">
              Assam Operational Command
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono font-medium text-emerald-400/90 tracking-wide">
              HSSE Real-time Telemetry Connected
            </span>
          </div>
        </div>
      </div>

      {/* Right: Operational Status, Priority Notifications, User Profile, Live Clock */}
      <div className="flex items-center gap-3 sm:gap-5">
        
        {/* Compact Live Status Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111724] border border-white/[0.06]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-medium text-slate-300">Operations Normal</span>
          <span className="text-[10px] font-mono text-slate-500">| AS-01</span>
        </div>

        {/* Priority Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#0c1017]">
              8
            </span>
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0f1522] border border-white/10 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-3.5 border-b border-white/[0.08] flex items-center justify-between bg-[#121929]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Priority Alerts</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400">
                    8 New
                  </span>
                </div>
                <button 
                  onClick={() => setNotificationsOpen(false)}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                >
                  Mark all read
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-white/[0.04]">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-white/[0.03] transition-colors cursor-pointer text-left">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-medium text-slate-200 line-clamp-1">{n.title}</p>
                      <span className="text-[10px] text-slate-500 shrink-0">{n.time}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {n.isSif ? (
                        <span className="text-[10px] font-mono text-red-400 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> SIF Precursor
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-emerald-400 font-medium flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Barrier Check
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-2 border-t border-white/[0.08] bg-[#121929] text-center">
                <button
                  onClick={() => {
                    setNotificationsOpen(false);
                    if (onNavigate) onNavigate('safety_reports');
                  }}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 cursor-pointer"
                >
                  View All Safety Events →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-800/60 transition-all cursor-pointer group text-left"
          >
            <div className="w-8 h-8 rounded-full bg-slate-700 group-hover:bg-amber-600/40 border border-slate-600/80 text-white font-bold text-xs flex items-center justify-center transition-colors shadow-xs">
              OD
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-xs font-bold text-slate-200 leading-tight group-hover:text-white">
                HSSE Director
              </span>
              <span className="text-[10px] font-mono text-slate-400 leading-tight">
                OIL-INDIA-HSSE
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-transform" />
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0f1522] border border-white/10 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-4 border-b border-white/[0.08] bg-[#121929]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-sm flex items-center justify-center">
                    OD
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Dr. O. D. Sharma</div>
                    <div className="text-[10px] text-amber-400 font-semibold">Chief HSE Auditor</div>
                    <div className="text-[10px] font-mono text-slate-400 truncate">admin1@gmail.com</div>
                  </div>
                </div>
              </div>

              <div className="p-2 space-y-1 text-xs">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    if (onNavigate) onNavigate('settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors text-left cursor-pointer"
                >
                  <User className="w-4 h-4 text-amber-400" />
                  <span>Account Settings</span>
                </button>
              </div>

              <div className="p-2 border-t border-white/[0.08] bg-[#121929]">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    if (onLogout) onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left cursor-pointer text-xs font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Date & Time Block */}
        <div className="hidden md:flex flex-col text-right pl-3 border-l border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium">
            {currentTime.date}
          </span>
          <span className="text-xs font-bold text-slate-200 font-mono">
            {currentTime.time}
          </span>
        </div>

      </div>

    </header>
  );
}
