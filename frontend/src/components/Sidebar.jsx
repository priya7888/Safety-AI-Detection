import { Link, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FilePlus2,
  ClipboardList,
  BrainCircuit,
  Target,
  CheckCircle2,
  ShieldAlert,
  LogOut,
  Building2,
  BadgeCheck,
  ShieldCheck,
  PlusCircle,
} from "lucide-react";

export const NAV_ITEMS = [
  {
    to: "/",
    label: "Dashboard",
    subtitle: "Safety Intelligence Overview",
    icon: LayoutDashboard,
    tab: "overview",
    end: true,
  },
  {
    to: "/analyze",
    label: "Submit Safety Report",
    subtitle: "UA, UC & Near-Miss",
    icon: FilePlus2,
    tab: "submit",
  },
  {
    to: "/reports",
    label: "Safety Reports",
    subtitle: "View & Manage Reports",
    icon: ClipboardList,
    tab: "reports",
  },
  {
    to: "/analyze",
    label: "AI Analysis",
    subtitle: "Explainable AI Results",
    icon: BrainCircuit,
    tab: "analyze",
  },
  {
    to: "/#sif-intelligence",
    label: "SIF Intelligence",
    subtitle: "Patterns & Safety Signals",
    icon: Target,
    tab: "intelligence",
  },
  {
    to: "/#review-feedback",
    label: "Review & Feedback",
    subtitle: "Human-in-the-Loop Review",
    icon: CheckCircle2,
    tab: "review",
  },
];

export default function Sidebar({ activeTab, onTabChange, onClose }) {
  return (
    <aside className="w-64 shrink-0 bg-[#0a0f1d] border-r border-slate-800 text-slate-200 flex flex-col justify-between h-full min-h-screen select-none">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck size={22} strokeWidth={2.4} />
            </div>
            <div>
              <div className="flex items-center tracking-tight font-display font-black text-lg text-white">
                Safety<span className="text-amber-400 font-extrabold ml-0.5">AI</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-tight">
                AI-Powered Safety Intelligence
              </p>
            </div>
          </Link>
        </div>

        {/* Primary Action Button */}
        <div className="p-3.5 pb-2">
          <Link
            to="/analyze"
            onClick={onClose}
            className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2 group"
          >
            <PlusCircle size={15} className="group-hover:rotate-90 transition-transform duration-200" />
            <span>+ Submit Safety Report</span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5">
          <p className="px-3 pt-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            NAVIGATION
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.end}
                onClick={() => {
                  if (onClose) onClose();
                  if (onTabChange && item.tab) onTabChange(item.tab);
                }}
                className={({ isActive }) =>
                  `w-full flex items-start gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? "bg-blue-600/20 text-white border border-blue-500/30 shadow-sm"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                  }`
                }
              >
                <Icon size={18} className="shrink-0 mt-0.5 text-blue-400" />
                <div className="min-w-0 text-left">
                  <p className="text-xs font-semibold leading-tight text-slate-100">{item.label}</p>
                  <p className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">{item.subtitle}</p>
                </div>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Organization Profile & Exit */}
      <div className="p-4 border-t border-slate-800/80 space-y-3 bg-[#080c18]">
        {/* Organization Card */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Building2 size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate leading-tight">
                Apex Industrial Safety
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] font-mono text-emerald-400 font-medium">Verified Org</span>
              </div>
            </div>
          </div>
        </div>

        {/* Exit / Logout Action */}
        <button
          onClick={() => {
            if (window.confirm("Exit SafetyAI platform?")) {
              window.location.href = "/";
            }
          }}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut size={14} />
          <span>Exit Platform</span>
        </button>
      </div>
    </aside>
  );
}
