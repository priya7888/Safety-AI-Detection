import React, { useState } from 'react';
import { 
  Settings, 
  Users, 
  Sliders, 
  Database, 
  Building2, 
  UploadCloud, 
  Key, 
  ShieldCheck, 
  CheckCircle2, 
  Check, 
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function SettingsView() {
  const { user } = useAuth();

  // Settings State
  const [sifConfidenceCutoff, setSifConfidenceCutoff] = useState(75);
  const [alertRecurrenceThreshold, setAlertRecurrenceThreshold] = useState(3);
  const [siteDensityThreshold, setSiteDensityThreshold] = useState(25);
  
  // API Integration Key State
  const [apiKey, setApiKey] = useState('oil_live_hsse_9f4820a8bc27419e');
  const [hsseApiStatus, setHsseApiStatus] = useState('CONNECTED');

  // File Upload State
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [savedSettingsSuccess, setSavedSettingsSuccess] = useState(false);

  // User & Role Table Data
  const [users, setUsers] = useState([
    { id: 1, name: 'Dr. Barun Borah', email: 'admin1@gmail.com', role: 'Corporate HSE Admin', site: 'Duliajan HQ', status: 'Active' },
    { id: 2, name: 'Rajiv Sharma', email: 'rajiv.sharma@oilindia.in', role: 'HSE Reviewer', site: 'Moran Deep Rig 9', status: 'Active' },
    { id: 3, name: 'Sunil Gogoi', email: 'sunil.gogoi@oilindia.in', role: 'Site Manager', site: 'Bay 2 Heavy Fab', status: 'Active' },
    { id: 4, name: 'Mousumi Phukan', email: 'mousumi.p@oilindia.in', role: 'HSE Reviewer', site: 'Wellhead Pad-4', status: 'Active' },
    { id: 5, name: 'Tapan Hazarika', email: 'tapan.h@oilindia.in', role: 'Viewer / Auditor', site: 'Digboi Refinery', status: 'Active' }
  ]);

  const handleSaveThresholds = (e) => {
    e.preventDefault();
    setSavedSettingsSuccess(true);
    setTimeout(() => setSavedSettingsSuccess(false), 3500);
  };

  const handleSimulateCSVUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFileName(file.name);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 4000);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto select-none">
      
      {/* 1. Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
            <Settings className="w-5 h-5" />
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
            Settings & Corporate Administration
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Configure SIF confidence thresholds, user roles, HSSE data ingestion pipelines, and organizational parameters
        </p>
      </div>

      {savedSettingsSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Configuration thresholds successfully saved to production NLP pipeline!</span>
        </div>
      )}

      {/* 2. SIF Model Threshold Configuration Form */}
      <div className="p-6 rounded-2xl bg-[#090D16] border border-slate-800/90 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white font-heading">
              SIF Confidence & Alert Trigger Thresholds
            </h3>
          </div>
          <span className="text-xs text-amber-400 font-mono">Dynamic NLP Guardrails</span>
        </div>

        <form onSubmit={handleSaveThresholds} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Slider 1: SIF Confidence Cutoff */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-200">SIF Confidence Cutoff</span>
              <span className="font-mono text-amber-400 font-bold">{sifConfidenceCutoff}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              value={sifConfidenceCutoff}
              onChange={(e) => setSifConfidenceCutoff(e.target.value)}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Observations with NLP probability &ge; {sifConfidenceCutoff}% automatically flag as SIF Potential.
            </p>
          </div>

          {/* Slider 2: Precursor Recurrence Frequency */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-200">Precursor Repeat Trigger</span>
              <span className="font-mono text-amber-400 font-bold">&ge; {alertRecurrenceThreshold} times</span>
            </div>
            <input
              type="range"
              min="2"
              max="10"
              value={alertRecurrenceThreshold}
              onChange={(e) => setAlertRecurrenceThreshold(e.target.value)}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Triggers Critical Precursor Alert if same barrier failure repeats within a 14-day rolling window.
            </p>
          </div>

          {/* Slider 3: Site SIF Density Warning */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-200">Site Critical Density</span>
              <span className="font-mono text-amber-400 font-bold">&ge; {siteDensityThreshold}%</span>
            </div>
            <input
              type="range"
              min="15"
              max="40"
              value={siteDensityThreshold}
              onChange={(e) => setSiteDensityThreshold(e.target.value)}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Flags facility as Critical Risk tier when SIF precursors exceed {siteDensityThreshold}% of total reports.
            </p>
          </div>

          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer font-heading"
            >
              Apply & Save Thresholds
            </button>
          </div>
        </form>
      </div>

      {/* 3. Data Sources & Bulk CSV Ingestion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* HSSE Platform API Connection */}
        <div className="p-6 rounded-2xl bg-[#090D16] border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white font-heading">
                HSSE Platform Live API Connection
              </h3>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {hsseApiStatus}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Production HSSE Webhook Endpoint</label>
              <input
                type="text"
                readOnly
                value="https://api.oilindia.in/hsse/v2/observations/stream"
                className="w-full p-2.5 bg-[#070A12] text-slate-300 font-mono rounded-xl border border-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">HSSE Ingestion Secret Key</label>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1 p-2.5 bg-[#070A12] text-slate-300 font-mono rounded-xl border border-slate-800 focus:outline-none"
                />
                <button
                  onClick={() => alert('API Key verified with Oil India HSSE Gateway')}
                  className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold border border-slate-700 cursor-pointer"
                >
                  Verify Key
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 pt-1">
              Provides real-time event streaming directly from field handhelds and web portals into SafetyAI.
            </p>
          </div>
        </div>

        {/* Bulk Historical CSV Upload */}
        <div className="p-6 rounded-2xl bg-[#090D16] border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white font-heading">
                Historical Safety Reports CSV Ingestion
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Bulk Upload</span>
          </div>

          <div className="border-2 border-dashed border-slate-700 hover:border-amber-400/80 rounded-xl p-6 text-center space-y-2 transition-colors relative cursor-pointer group bg-slate-900/40">
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleSimulateCSVUpload}
              className="absolute inset-0 opacity-0 cursor-pointer" 
            />
            <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-amber-400 mx-auto transition-colors" />
            <div className="text-xs font-bold text-slate-200">
              Drag & Drop Historical CSV file here, or click to browse
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Supports standard OIL HSSE columns (Observation, Date, Location, Equipment)
            </p>
          </div>

          {uploadSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Ingested <strong>{uploadFileName}</strong>: 401 historical records added to triage queue!</span>
            </div>
          )}
        </div>

      </div>

      {/* 4. User & Role Management Table */}
      <div className="rounded-2xl bg-[#090D16] border border-slate-800/90 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white font-heading">
              Authorized HSSE Users & Access Roles
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">5 Team Members</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0D1424] border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="p-3.5">Name</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Access Role</th>
                <th className="p-3.5">Assigned Facility</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-850 transition-colors">
                  <td className="p-3.5 font-bold text-white">
                    {u.name}
                  </td>
                  <td className="p-3.5 font-mono text-slate-400">
                    {u.email}
                  </td>
                  <td className="p-3.5">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-300">
                    {u.site}
                  </td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
