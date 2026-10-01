import React, { useState } from 'react';
import { X, Upload, ShieldAlert, Sparkles, Check } from 'lucide-react';

export default function UploadReportModal({ isOpen, onClose, onReportAdded }) {
  const [title, setTitle] = useState('');
  const [activity, setActivity] = useState('Drilling');
  const [location, setLocation] = useState('Assam Asset – Drilling Rig 04');
  const [energySource, setEnergySource] = useState('Gravity');
  const [description, setDescription] = useState('');
  const [remediation, setRemediation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);

    // AI assessment calculation simulation
    setTimeout(() => {
      const isHighEnergy = ['Gravity', 'Pressure', 'Electrical'].includes(energySource);
      const newReport = {
        id: `#${Math.floor(1050 + Math.random() * 50)}`,
        rawId: Date.now(),
        title: title.trim(),
        activity,
        location,
        date: 'Today, Just now',
        timestamp: new Date().toISOString(),
        sifPotential: isHighEnergy ? 'YES' : 'NO',
        confidence: isHighEnergy ? 89 : 22,
        status: isHighEnergy ? 'Investigate' : 'Reviewed',
        statusColor: isHighEnergy ? 'red' : 'blue',
        hazard: `${energySource} Energy Hazard / High Exposure`,
        energySource: `${energySource} Energy`,
        barrierStatus: isHighEnergy ? 'BARRIER_DEGRADED' : 'BARRIER_EFFECTIVE',
        failedBarrier: isHighEnergy ? 'Physical Perimeter Barricade' : 'None',
        description: description.trim(),
        remediationAction: remediation.trim() || 'Stop-work initiated by field observer.',
        reporter: 'Dr. O. D. Sharma (HSSE Director)',
        humanValidation: 'Pending HSSE Review'
      };

      if (onReportAdded) {
        onReportAdded(newReport);
      }

      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1200);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0d121c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#111724]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-heading">
                Log SIF Observation & Precursor Event
              </h2>
              <p className="text-xs text-slate-400">
                OIL INDIA Operational HSSE Submission & AI Precursor Classification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300">
          
          {/* Report Title */}
          <div>
            <label className="block font-semibold text-white mb-1.5">
              Report Title / Hazard Summary *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Unbolted high pressure flange clamp during mud circulation"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
            />
          </div>

          {/* Activity & Location Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-white mb-1.5">Activity Area</label>
              <select
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500 text-xs"
              >
                <option value="Drilling">Drilling Operations</option>
                <option value="Maintenance">Maintenance & Overhauls</option>
                <option value="Operations">Operations & Processing</option>
                <option value="Inspection">Inspection & Integrity</option>
                <option value="Construction">Construction & Civil</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-white mb-1.5">Asset / Location</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500 text-xs"
              >
                <option value="Assam Asset – Drilling Rig 04">Assam Asset – Rig 04</option>
                <option value="Duliajan CPF – Compressor Unit 3">Duliajan CPF</option>
                <option value="Digboi Facility – Tank Farm 12">Digboi Facility</option>
                <option value="Naharkatiya Station – Gas Processing">Naharkatiya Station</option>
                <option value="Moran Field – Chemical Injection Skid B">Moran Field</option>
              </select>
            </div>
          </div>

          {/* Energy Source */}
          <div>
            <label className="block font-semibold text-white mb-1.5">
              Primary Energy Source Involved (IOGP Energy Wheel)
            </label>
            <select
              value={energySource}
              onChange={(e) => setEnergySource(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500 text-xs"
            >
              <option value="Gravity">Gravity (Suspended loads, work at height &gt;1.8m)</option>
              <option value="Pressure">Pressure (Pressurized fluid, gas &gt;150 PSI, relief valves)</option>
              <option value="Electrical">Electrical (High voltage &gt;440V, arc flash)</option>
              <option value="Chemical">Chemical (Toxic H2S, corrosives, acids)</option>
              <option value="Kinetic">Kinetic & Mechanical (Rotating shafts, heavy machinery)</option>
              <option value="Thermal">Thermal (Open flames, cryogenic, hot work)</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-white mb-1.5">
              Observed Event / Condition Narrative *
            </label>
            <textarea
              required
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the weak signal, unsafe condition, or near-miss observation in detail..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
            />
          </div>

          {/* Immediate Remediation */}
          <div>
            <label className="block font-semibold text-white mb-1.5">
              Immediate Control Action Taken
            </label>
            <input
              type="text"
              value={remediation}
              onChange={(e) => setRemediation(e.target.value)}
              placeholder="e.g. Stop-work executed, tagged out, drop-zone barricade placed"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
            />
          </div>

          {/* AI Notice */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              Upon submission, the SafetyAI engine evaluates SIF precursors against OIL INDIA safety barrier criteria.
            </span>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isSuccess}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all cursor-pointer"
            >
              {isSuccess ? (
                <>
                  <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                  <span>Report Submitted!</span>
                </>
              ) : isSubmitting ? (
                <span>Analyzing & Saving...</span>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Log SIF Observation</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
