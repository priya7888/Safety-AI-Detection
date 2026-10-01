import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  Lock, 
  ShieldCheck 
} from 'lucide-react';

export default function ContactPage({ onNavigate, onOpenLogin, onOpenDemo }) {
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
    <div className="w-full text-slate-100 bg-[#07101F] selection:bg-amber-500 selection:text-slate-950 pt-24">
      
      {/* Header Banner */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#07101F] via-slate-900 to-[#07101F] border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Mail className="w-3.5 h-3.5 text-amber-400" />
            <span>CONTACT SAFETYAI</span>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white font-heading tracking-tight leading-tight">
            Get In Touch with <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">
              Our HSSE Team
            </span>
          </h1>
          <p className="max-w-3xl mx-auto text-base sm:text-xl text-slate-300 font-light leading-relaxed">
            Have questions about enterprise deployment, automated incident triage, or pilot testing across drilling fields? Reach out directly.
          </p>
        </div>
      </section>

      {/* Main Section with Signature Vertical Line */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        
        {/* Continuous Signature Vertical Orange Line */}
        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-[2px] bg-gradient-to-b from-amber-400 via-yellow-400 to-amber-500 opacity-60 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-24">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-0 items-start">
            
            {/* Left: Contact Info & Oil India Operations */}
            <div className="lg:col-span-6 lg:pr-16 space-y-8 text-left">
              
              <div>
                <div className="text-xs font-mono text-amber-400 font-bold uppercase tracking-widest mb-2">
                  ENTERPRISE HSSE COMMUNICATIONS
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white font-heading leading-tight">
                  Contact Us
                </h2>
                <p className="text-base text-slate-300 leading-relaxed font-light mt-3">
                  Our engineering and safety analytics team works alongside Oil India Limited operations to ensure seamless field data synchronization.
                </p>
              </div>

              {/* Email Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-mono font-bold text-amber-400 uppercase">Organization Email</div>
                  <a href="mailto:contact@oilindia.in" className="text-sm font-semibold text-white hover:text-amber-400 transition-colors block">
                    contact@oilindia.in
                  </a>
                  <div className="text-[11px] text-slate-400">Official Oil India HSSE liaison</div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-mono font-bold text-amber-400 uppercase">Support Email</div>
                  <a href="mailto:support@safetyai.gov.in" className="text-sm font-semibold text-white hover:text-amber-400 transition-colors block">
                    support@safetyai.gov.in
                  </a>
                  <div className="text-[11px] text-slate-400">24/7 AI Platform Technical Support</div>
                </div>
              </div>

              {/* Physical / Operational Info */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-1" />
                  <div className="text-xs sm:text-sm text-slate-300">
                    <strong className="text-white block">Oil India Limited Field Headquarters</strong>
                    Duliajan, Dibrugarh District, Assam 786602, India
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-1" />
                  <div className="text-xs sm:text-sm text-slate-300">
                    <strong className="text-white block">Smart India Hackathon 2024 / 2025</strong>
                    Problem Statement #165 / #26165 (OIL HSSE AI Prototype)
                  </div>
                </div>
              </div>

            </div>

            {/* Right: Contact Form */}
            <div className="lg:col-span-6 lg:pl-16">
              <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl text-left space-y-6">
                
                <div>
                  <h3 className="text-2xl font-bold text-white font-heading">
                    Send Us a Message
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Fill out the form below to request a demonstration or submit an integration request.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajesh Barua"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/90 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. rajesh@oilindia.in"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/90 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5">
                      Organization / Department
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. OIL Operations / HSSE Team"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/90 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5">
                      Message
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Describe your inquiry or requested safety intelligence feature..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/90 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors resize-none"
                    />
                  </div>

                  {submitted ? (
                    <div className="flex items-center gap-2.5 p-4 rounded-xl bg-emerald-950/90 border border-emerald-700 text-emerald-300 text-sm font-bold">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span>Thank you! Your message has been routed to our HSSE response engineers.</span>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold text-base shadow-xl shadow-amber-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send Message</span>
                    </button>
                  )}
                </form>

              </div>
            </div>

          </div>

        </div>

      </section>

      {/* Organization Login Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 border-t border-slate-800 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-2xl sm:text-4xl font-bold text-white font-heading">
            Authorized Personnel Login
          </h3>
          <p className="text-slate-400 text-sm sm:text-base">
            Already have enterprise SSO credentials? Access the protected real-time command dashboard directly.
          </p>
          <div className="pt-2">
            <button
              onClick={onOpenLogin}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-black text-sm tracking-wide shadow-2xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Building2 className="w-5 h-5" />
              <span>Organization Login</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
