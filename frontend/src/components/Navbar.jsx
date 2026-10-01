import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  ShieldAlert,
  Sparkles,
  Menu,
  X,
  Radio,
  FileSpreadsheet,
  History,
  LayoutDashboard,
  Sun,
  Moon,
  ArrowRight,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toggleTheme, isDark } = useTheme();

  const navLinks = [
    { to: "/", label: "PLATFORM", icon: Radio, end: true },
    { to: "/analyze", label: "AI SCANNER", icon: Sparkles },
    { to: "/dashboard", label: "ANALYTICS", icon: LayoutDashboard },
    { to: "/upload", label: "BULK UPLOAD", icon: FileSpreadsheet },
    { to: "/reports", label: "INCIDENTS", icon: History },
  ];

  return (
    <header className="sticky top-4 z-50 w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pointer-events-none">
      <div className="pointer-events-auto rounded-2xl sm:rounded-full border dark:border-white/15 border-slate-200/90 dark:bg-black/65 bg-white/80 backdrop-blur-2xl px-4 sm:px-6 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.25)] flex items-center justify-between gap-4 transition-all duration-300">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-rose-500 via-rose-600 to-crimson-700 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.5)] group-hover:shadow-[0_0_30px_rgba(244,63,94,0.8)] transition-all">
              <ShieldAlert size={20} className="text-white transform group-hover:scale-110 transition-transform" strokeWidth={2.4} />
            </div>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <span className="font-display font-black text-base sm:text-lg dark:text-white text-slate-900 tracking-wider">
              SIF<span className="text-rose-500 dark:text-rose-400 font-extrabold">SENTINEL</span>
            </span>
          </div>
        </Link>

        {/* Center Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider transition-all ${
                  isActive
                    ? "dark:text-white text-slate-900 dark:bg-white/15 bg-slate-900 text-white shadow-sm"
                    : "dark:text-slate-300 text-slate-600 dark:hover:text-white hover:text-slate-900 dark:hover:bg-white/10 hover:bg-slate-100"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right Actions: Theme Toggle, Log in & Request Demo / Scan button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark / Light Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border dark:border-white/15 border-slate-200 dark:bg-white/5 bg-slate-100 dark:text-amber-400 text-slate-700 hover:scale-105 active:scale-95 transition-all shadow-sm flex items-center justify-center cursor-pointer group"
            title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
            aria-label="Toggle theme mode"
          >
            {isDark ? (
              <Sun size={16} className="transform group-hover:rotate-45 transition-transform text-amber-400" />
            ) : (
              <Moon size={16} className="transform group-hover:-rotate-12 transition-transform text-slate-700" />
            )}
          </button>

          <Link
            to="/analyze"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-mono font-bold uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 via-rose-600 to-crimson-600 hover:from-purple-500 hover:to-rose-500 shadow-[0_0_25px_rgba(225,29,72,0.45)] hover:shadow-[0_0_35px_rgba(225,29,72,0.7)] hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <Sparkles size={14} />
            <span>REQUEST DEMO</span>
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl dark:text-slate-300 text-slate-600 hover:text-slate-900 dark:hover:text-white transition-colors border dark:border-white/10 border-slate-200"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 pointer-events-auto rounded-2xl border dark:border-white/15 border-slate-200 dark:bg-black/90 bg-white/95 backdrop-blur-2xl p-4 space-y-2 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          {navLinks.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider transition-all ${
                  isActive
                    ? "dark:bg-white/15 bg-slate-900 text-white font-bold"
                    : "dark:text-slate-300 text-slate-700 hover:dark:bg-white/5 hover:bg-slate-100"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          <Link
            to="/analyze"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-center mt-3 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 to-rose-600 shadow-md"
          >
            START AI SCANNER
          </Link>
        </div>
      )}
    </header>
  );
}
