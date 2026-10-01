import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  PlusCircle,
  Sun,
  Moon,
  Menu,
  X,
  Building2,
  Bell,
  Sparkles,
  FilePlus2,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import Sidebar from "./Sidebar";

export default function Layout({ title, description, activeTab, onTabChange, action, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen dark:bg-[#07090e] bg-[#f4f7fb] dark:text-slate-100 text-slate-900 transition-colors duration-200 antialiased font-sans">
      {/* 1. Left Persistent Dark Navy Sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-50 w-64">
        <Sidebar activeTab={activeTab} onTabChange={onTabChange} />
      </div>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#0a0f1d] shadow-2xl z-50">
            <div className="absolute top-3 right-3 z-50">
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>
            <Sidebar activeTab={activeTab} onTabChange={onTabChange} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* 2. Main Shell with Topbar & Page Content */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header Navigation */}
        <header className="sticky top-0 z-40 dark:bg-[#07090e]/95 bg-white/95 backdrop-blur-xl border-b dark:border-white/[0.08] border-slate-200/90 px-4 sm:px-8 py-3 flex items-center justify-between gap-4 transition-colors">
          {/* Left: Mobile Menu & Header Titles */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>

            <div>
              <h1 className="font-display font-extrabold text-base sm:text-lg dark:text-white text-slate-900 tracking-tight leading-tight">
                {title || "Safety Intelligence Dashboard"}
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-tight">
                {description || "AI-powered analysis of your organization's safety reports."}
              </p>
            </div>
          </div>

          {/* Right: CTA, Org Profile & Theme Toggle */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Direct Action or Top CTA */}
            {action ? (
              action
            ) : (
              <Link
                to="/analyze"
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <PlusCircle size={14} />
                <span>+ Submit Safety Report</span>
              </Link>
            )}

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-white/[0.04] bg-slate-50 text-slate-600 dark:text-amber-400 hover:scale-105 active:scale-95 transition-all shadow-xs flex items-center justify-center cursor-pointer"
              title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} className="text-slate-700" />}
            </button>

            {/* Organization Profile Avatar */}
            <div className="flex items-center gap-2 pl-1 border-l dark:border-slate-800 border-slate-200">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                AI
              </div>
              <div className="hidden md:block text-left">
                <strong className="text-xs font-semibold dark:text-white text-slate-900 block leading-tight">
                  Apex Safety Org
                </strong>
                <span className="text-[10px] text-emerald-500 font-mono font-medium leading-tight flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Verified
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>

        {/* Enterprise Footer */}
        <footer className="border-t dark:border-white/[0.06] border-slate-200 px-4 sm:px-8 py-5 text-center text-xs dark:text-slate-500 text-slate-500">
          SafetyAI <span className="mx-2">•</span> AI-Powered SIF Precursor Detection &amp; Safety Intelligence <span className="mx-2">•</span> Human-in-the-Loop Decision Support
        </footer>
      </div>
    </div>
  );
}
