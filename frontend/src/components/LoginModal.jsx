import React, { useState } from 'react';
import { Shield, ArrowLeft, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

const validAccounts = [
  { orgId: 'id001', email: 'admin1@gmail.com', password: 'Admin1@123', orgName: 'Oil India Limited' },
  { orgId: 'id002', email: 'admin2@gmail.com', password: 'Admin2@123', orgName: 'Organization 02' },
  { orgId: 'id003', email: 'admin3@gmail.com', password: 'Admin3@123', orgName: 'Organization 03' },
  { orgId: 'id004', email: 'admin4@gmail.com', password: 'Admin4@123', orgName: 'Organization 04' },
  { orgId: 'id005', email: 'admin5@gmail.com', password: 'Admin5@123', orgName: 'Organization 05' },
];

import { useAuth } from '../context/AuthContext';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const { login } = useAuth();
  const [orgId, setOrgId] = useState('id001');
  const [userId, setUserId] = useState('admin1@gmail.com');
  const [password, setPassword] = useState('Admin1@123');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await login(orgId, userId, password);
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        if (onLoginSuccess) onLoginSuccess();
      }, 1000);
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Invalid login credentials');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-[#09090b] overflow-y-auto lg:overflow-hidden animate-in fade-in duration-300 flex flex-col lg:flex-row select-none">
      
      {/* ================= LEFT HALF: BRIGHT CLEAR IMAGE WITH ACCESSIBLE BADGE ================= */}
      <div className="relative w-full lg:w-1/2 min-h-[440px] lg:min-h-screen bg-[#09090b] overflow-hidden flex flex-col justify-between p-6 sm:p-10 lg:p-14">
        
        {/* Background Image: Crisp, clear, high visibility with NO heavy darkening */}
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/images/pic-5.jpg"
            alt="Safety First Petroleum Engineer"
            className="w-full h-full object-cover object-center transform scale-100 filter brightness-100 contrast-100"
          />
          {/* Subtle Scrim for text legibility strictly at the bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent z-10" />
        </div>

        {/* Top Left: Clickable Logo Badge -> Returns to Main Site */}
        <div className="relative z-20">
          <button
            type="button"
            onClick={onClose}
            title="Click to go to main website"
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-black/60 hover:bg-black/85 backdrop-blur-md border border-white/30 hover:border-amber-400 text-white shadow-xl transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 group"
          >
            <Shield className="w-4 h-4 text-amber-400 fill-amber-400/20 group-hover:rotate-12 transition-transform duration-200" />
            <span className="text-sm font-black font-heading tracking-wide">SafetyAI</span>
            <span className="text-[11px] text-slate-300 font-mono pl-2 border-l border-white/20 group-hover:text-amber-400 transition-colors flex items-center gap-1">
              <span>Main Site</span>
              <span className="text-xs">↗</span>
            </span>
          </button>
        </div>

        {/* Bottom Left: Clean Headline and Subtitle */}
        <div className="relative z-20 space-y-3 max-w-lg mt-auto pt-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-white tracking-tight leading-tight drop-shadow-md">
            Organization Safety Portal
          </h2>
          
          <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-medium drop-shadow-sm">
            Secure access to your organization's SIF precursor intelligence workspace.
          </p>
        </div>

      </div>

      {/* ================= RIGHT HALF: CLEAN MINIMAL FORM (NO HARSH BLUE INTENSITY) ================= */}
      <div className="w-full lg:w-1/2 min-h-screen bg-white dark:bg-[#09090b] flex flex-col justify-between p-6 sm:p-12 lg:p-16 relative overflow-y-auto">
        
        {/* Centered Login Box */}
        <div className="max-w-md w-full mx-auto my-auto space-y-6">
          
          {/* Back to Website Link */}
          <div>
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-amber-400 transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Website</span>
            </button>
          </div>

          {/* Form Header */}
          <div className="space-y-1.5 pt-2">
            <h1 className="text-3xl sm:text-4xl font-bold font-heading text-slate-950 dark:text-white tracking-tight">
              Organization Login
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Sign in to your safety intelligence workspace.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          {isSuccess ? (
            <div className="py-12 text-center space-y-4 animate-in fade-in zoom-in duration-200">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-white">
                Login Successful
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                Authenticated successfully. Redirecting to main website...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              
              {/* Organization ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-300 mb-1.5">
                  Organization ID
                </label>
                <input
                  type="text"
                  value={orgId}
                  onChange={(e) => setOrgId(e.target.value)}
                  placeholder="id001"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#141418] border border-slate-200 dark:border-[#27272e] text-sm font-medium text-slate-900 dark:text-white placeholder-slate-500 focus:bg-white dark:focus:bg-[#18181e] focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all shadow-2xs"
                  required
                />
              </div>

              {/* User ID or Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-300 mb-1.5">
                  User ID or Email
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="admin1@gmail.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#141418] border border-slate-200 dark:border-[#27272e] text-sm font-medium text-slate-900 dark:text-white placeholder-slate-500 focus:bg-white dark:focus:bg-[#18181e] focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all shadow-2xs"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Admin1@123"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#141418] border border-slate-200 dark:border-[#27272e] text-sm font-medium text-slate-900 dark:text-white placeholder-slate-500 focus:bg-white dark:focus:bg-[#18181e] focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all shadow-2xs tracking-widest"
                  required
                />
              </div>

              {/* Options: Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500 accent-amber-500"
                  />
                  <span>Remember me</span>
                </label>
                
                <a
                  href="#forgot-password"
                  onClick={(e) => e.preventDefault()}
                  className="text-xs text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-amber-400 transition-colors font-medium"
                >
                  Forgot password?
                </a>
              </div>

              {/* Full Width Login Button (Clean Brand Accent, Zero Heavy Blue) */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Login to Safety Intelligence</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>

        {/* Bottom Security Note */}
        <div className="text-center pt-8">
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            <span>256-Bit Encrypted OIL SIF Security Standard</span>
          </div>
        </div>

      </div>

    </div>
  );
}