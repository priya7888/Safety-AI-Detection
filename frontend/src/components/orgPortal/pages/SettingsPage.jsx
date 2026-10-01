import React, { useState } from 'react';
import { 
  User, 
  Building2, 
  Bell, 
  ShieldCheck, 
  Sliders, 
  SlidersHorizontal, 
  Check, 
  Lock, 
  Save, 
  Smartphone, 
  Mail,
  Zap,
  RotateCcw
} from 'lucide-react';
import PageHeader from '../common/PageHeader';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [savedToast, setSavedToast] = useState(false);

  // Profile Form state
  const [fullName, setFullName] = useState('Dr. O. D. Sharma');
  const [email, setEmail] = useState('admin1@gmail.com');
  const [role, setRole] = useState('HSSE Director & Chief HSE Auditor');
  const [staffId, setStaffId] = useState('OIL-HSE-DIR-001');

  // AI & SIF Configuration State
  const [sifThreshold, setSifThreshold] = useState(80);
  const [autoFlagging, setAutoFlagging] = useState(true);
  const [weakSignalSens, setWeakSignalSens] = useState('High');

  // Notification State
  const [emailDigest, setEmailDigest] = useState(true);
  const [smsUrgent, setSmsUrgent] = useState(true);
  const [barrierAlerts, setBarrierAlerts] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const navTabs = [
    { id: 'profile', label: 'User Profile', icon: User },
    { id: 'organization', label: 'Organization Info', icon: Building2 },
    { id: 'ai_settings', label: 'AI SIF Sensitivity', icon: Sliders },
    { id: 'notifications', label: 'Alert Channels', icon: Bell },
    { id: 'security', label: 'Security & Auth', icon: Lock }
  ];

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      
      {/* Page Header */}
      <PageHeader
        title="Settings"
        subtitle="Manage user authentication profile, AI precursor sensitivity thresholds, notification alerts, and enterprise security."
        badge="Governance Active"
      />

      {/* Success Toast */}
      {savedToast && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4" />
          <span>Configuration settings saved successfully.</span>
        </div>
      )}

      {/* Settings Container */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Settings Sidebar (col-span-4) */}
        <div className="md:col-span-4 rounded-2xl bg-[#0f141e] border border-white/[0.08] p-3 shadow-xl space-y-1 h-fit">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Settings Form Container (col-span-8) */}
        <div className="md:col-span-8 rounded-2xl bg-[#0f141e] border border-white/[0.08] p-6 shadow-xl space-y-5">
          
          {/* TAB 1: User Profile */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSave} className="space-y-4 text-xs text-slate-300">
              <div>
                <h3 className="text-sm font-bold text-white mb-1 font-heading">User Profile Information</h3>
                <p className="text-slate-400">Designated HSSE Auditor contact details</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#131926] border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Operational Role</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#131926] border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Staff / Badge Number</label>
                  <input
                    type="text"
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#131926] border border-slate-700 text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.06] flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Organization Info */}
          {activeTab === 'organization' && (
            <div className="space-y-4 text-xs text-slate-300">
              <div>
                <h3 className="text-sm font-bold text-white mb-1 font-heading">Enterprise Organization Details</h3>
                <p className="text-slate-400">Headquarters location and industrial operating profile</p>
              </div>

              <div className="p-4 rounded-xl bg-[#121826] border border-white/[0.06] space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Organization Name:</span>
                  <span className="text-white font-bold">Oil India Limited – Operational Safety Unit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Organization Identifier:</span>
                  <span className="text-amber-400 font-mono font-bold">id001</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Operational Region:</span>
                  <span className="text-white">Assam & Arunachal Exploration Basins</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">HSSE Tier:</span>
                  <span className="text-emerald-400 font-semibold">Tier 1 Petroleum Producer</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AI SIF Sensitivity */}
          {activeTab === 'ai_settings' && (
            <div className="space-y-5 text-xs text-slate-300">
              <div>
                <h3 className="text-sm font-bold text-white mb-1 font-heading">AI SIF Precursor Detection Model Calibration</h3>
                <p className="text-slate-400">Tune the confidence thresholds for automated precursor flagging</p>
              </div>

              <div className="p-4 rounded-xl bg-[#121826] border border-white/[0.06] space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold text-white">SIF Precursor Flagging Threshold</span>
                    <span className="font-mono font-bold text-amber-400">{sifThreshold}% Confidence</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="95"
                    value={sifThreshold}
                    onChange={(e) => setSifThreshold(e.target.value)}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Reports with AI probability exceeding this threshold will automatically alert the on-duty HSSE Director.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                  <div>
                    <span className="font-semibold text-white block">Automated High-Energy Barrier Verification</span>
                    <span className="text-[11px] text-slate-400">Cross-reference reports against IOGP Energy Wheel</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoFlagging}
                    onChange={(e) => setAutoFlagging(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    setSavedToast(true);
                    setTimeout(() => setSavedToast(false), 3000);
                  }}
                  className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 cursor-pointer"
                >
                  Update AI Sensitivity
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Alert Channels */}
          {activeTab === 'notifications' && (
            <div className="space-y-4 text-xs text-slate-300">
              <div>
                <h3 className="text-sm font-bold text-white mb-1 font-heading">Notification & Escalation Channels</h3>
                <p className="text-slate-400">Select when and where critical HSE alerts are dispatched</p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#121826] border border-white/[0.06] cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="font-semibold text-white block">Daily Morning HSSE Briefing</span>
                      <span className="text-[11px] text-slate-400">Consolidated precursor & barrier health summary</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailDigest}
                    onChange={(e) => setEmailDigest(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#121826] border border-white/[0.06] cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-4 h-4 text-red-400" />
                    <div>
                      <span className="font-semibold text-white block">Immediate High-SIF SMS Escalation</span>
                      <span className="text-[11px] text-slate-400">Triggered on confirmed critical control bypasses</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsUrgent}
                    onChange={(e) => setSmsUrgent(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#121826] border border-white/[0.06] cursor-pointer">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-semibold text-white block">Barrier Degradation Notifications</span>
                      <span className="text-[11px] text-slate-400">Notify when critical controls require re-inspection</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={barrierAlerts}
                    onChange={(e) => setBarrierAlerts(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 5: Security */}
          {activeTab === 'security' && (
            <div className="space-y-4 text-xs text-slate-300">
              <div>
                <h3 className="text-sm font-bold text-white mb-1 font-heading">Security & Session Management</h3>
                <p className="text-slate-400">Active authentication protocols for organization access</p>
              </div>

              <div className="p-4 rounded-xl bg-[#121826] border border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white block">Two-Factor Authentication (2FA)</span>
                    <span className="text-[11px] text-slate-400">Hardware token or authenticator app</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400">
                    Enforced by Enterprise Policy
                  </span>
                </div>

                <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white block">Active Enterprise Session</span>
                    <span className="text-[11px] text-slate-400">OIL-INDIA Secured VPN Gateway</span>
                  </div>
                  <span className="text-emerald-400 font-mono text-[11px] font-bold">256-bit Encrypted</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
