import React, { useState } from 'react';
import { Building2, ArrowRight, ShieldCheck, Sparkles, Lock, Mail, Send, CheckCircle2 } from 'lucide-react';

export default function CtaSection({ onLogin, onOpenDemo }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email) return;
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', organization: '', message: '' });
      setSubmitted(false);
    }, 4000);
  };

  return (
    <section 
      id="contact" 
      className="py-24 md:py-32 bg-[#070709] text-white relative transition-colors duration-300 overflow-hidden"
    >
      
      {/* Background Soft Glow */}
      <div className="absolute top-1/4 left-10 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* 7th Page Layout: STRICT LEFT CONTACT FORM | STRICT RIGHT ORGANIZATION LOGIN CARD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-0 items-center">
          
          {/* LEFT SIDE: Contact Information & Form strictly on the left */}
          <div className="lg:col-span-6 lg:pr-14 space-y-6 text-left">
            
            {/* Category Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Mail className="w-3.5 h-3.5" />
              <span>Contact SafetyAI</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 text-slate-950 text-xs font-bold font-mono shadow-sm">
                06
              </span>
              <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
                GET IN TOUCH & HSSE SUPPORT
              </span>
            </div>

            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white font-heading leading-tight tracking-tight">
              Contact Us & Enterprise Support
            </h3>

            {/* Support Emails */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="text-[11px] font-mono text-amber-400 font-bold uppercase">Organization Email</div>
                <a href="mailto:contact@oilindia.in" className="text-sm font-semibold text-slate-200 hover:text-amber-400 transition-colors">
                  contact@oilindia.in
                </a>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="text-[11px] font-mono text-amber-400 font-bold uppercase">Support Email</div>
                <a href="mailto:support@safetyai.gov.in" className="text-sm font-semibold text-slate-200 hover:text-amber-400 transition-colors">
                  support@safetyai.gov.in
                </a>
              </div>
            </div>

            {/* Interactive Contact Form */}
            <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase mb-1">Your Name</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Ramesh Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase mb-1">Email Address</label>
                  <input 
                    type="email"
                    required
                    placeholder="name@oilindia.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase mb-1">Organization / Department</label>
                <input 
                  type="text"
                  placeholder="e.g. OIL Duliajan Operations / HSSE Team"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase mb-1">Message</label>
                <textarea 
                  rows={2}
                  required
                  placeholder="Inquire about safety report integration or pilot deployment..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors resize-none"
                />
              </div>

              {submitted ? (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Thank you! Your message has been sent to our HSSE response team.</span>
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold text-sm shadow-md transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              )}
            </form>

          </div>

          {/* RIGHT SIDE: Organization Login Card strictly on the right */}
          <div className="lg:col-span-6 lg:pl-14">
            <div className="relative group mx-auto max-w-md lg:max-w-none">
              
              {/* Stacked Glow Shadow */}
              <div className="absolute inset-0 bg-amber-500/20 rounded-3xl blur-xl" />

              {/* Glass Action Card */}
              <div className="relative rounded-3xl p-8 sm:p-10 bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-6 text-left">
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/25">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white font-heading">
                      Oil India Limited Portal
                    </h4>
                    <span className="text-xs font-mono text-amber-400">
                      Problem Statement #26165
                    </span>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  Sign in with your enterprise credentials to access real-time rig precursor heatmaps, automated triage feeds, and compliance audit exports.
                </p>

                <div className="space-y-3 pt-2">
                  <button
                    onClick={onLogin}
                    className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold text-base shadow-xl shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <Building2 className="w-5 h-5" />
                    <span>Organization Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
                    <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-emerald-400" /> Protected Portal</span>
                    <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> SIH PS #165 Live</span>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}