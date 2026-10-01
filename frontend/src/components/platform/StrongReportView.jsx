import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Cpu, 
  MapPin, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  FileText,
  Flame,
  Zap,
  Activity,
  AlertOctagon
} from 'lucide-react';
import FullAnalysisModal from './FullAnalysisModal';

export default function StrongReportView() {
  const [selectedReport, setSelectedReport] = useState(null);

  // High-value, high-consequence safety reports
  const strongReports = [
    {
      id: 101,
      report_reference: 'SR-CRIT-2026-01',
      report_type: 'Near Miss',
      title: 'Suspended 2-Ton Casing Flange Dropped on Drill Floor Walkway',
      description: 'During crane hoisting operation at Rig 04 Derrick Floor, a 4-inch heavy steel drilling flange slipped from the rigging sling at a height of 18 meters and fell 2 meters away from two roughnecks positioning casing pipe. No exclusion zone barricade was established around the drop zone.',
      location: 'Plant 03 • Drilling Rig 04',
      facility_unit: 'Derrick Floor Area',
      report_date: '2026-09-06',
      sif_potential: 'FATALITY / PERMANENT DISABILITY POTENTIAL (98%)',
      ai_confidence: 96.4,
      risk_score: 94,
      investigation_priority: 'P1 IMMEDIATE MANDATORY STOP-WORK',
      energy_source: 'Gravitational Potential Energy (2,000 kg at 18m)',
      barrier_status: 'DIRECT BARRIER TOTALLY ABSENT',
      key_learnings: 'Overhead travel across active working pathways requires physical interlocked laser or chain gate exclusion barriers.'
    },
    {
      id: 102,
      report_reference: 'SR-CRIT-2026-02',
      report_type: 'Unsafe Act',
      title: 'High Voltage 11kV Substation Switchgear Live Entry without LOTO',
      description: 'Maintenance technician observed entering high-voltage 11kV electrical substation switchgear room to perform circuit breaker inspection without conducting Lock-Out/Tag-Out (LOTO) energy isolation or verifying zero-energy state with a calibrated voltage detector.',
      location: 'Plant 01 • Central Processing Facility',
      facility_unit: 'Main Substation A',
      report_date: '2026-09-06',
      sif_potential: 'SEVERE ARC FLASH / FATAL ELECTROCUTION POTENTIAL (94%)',
      ai_confidence: 94.8,
      risk_score: 91,
      investigation_priority: 'P1 IMMEDIATE AUDIT ENFORCEMENT',
      energy_source: 'High-Voltage Electrical Energy (11,000 Volts)',
      barrier_status: 'CRITICAL ISOLATION PROTOCOL BYPASSED',
      key_learnings: 'Zero-energy verification must be signed off by a second authorized electrical auditor prior to enclosure door opening.'
    },
    {
      id: 103,
      report_reference: 'SR-CRIT-2026-03',
      report_type: 'Near Miss',
      title: 'High-Pressure Sour Gas Bleed Valve Failure During Flange Torqueing',
      description: 'Flange bolt makeup was attempted on high-pressure sour gas manifold while residual pressure remained trapped at 40 bar behind a passing isolation valve. Valve hiss alerted crew before complete seal breach.',
      location: 'Plant 05 • Wellhead Pad-4',
      facility_unit: 'Gathering Station Manifold',
      report_date: '2026-09-05',
      sif_potential: 'TOXIC H2S ASPHYXIATION & PRESSURE INJECTION POTENTIAL (92%)',
      ai_confidence: 97.2,
      risk_score: 89,
      investigation_priority: 'P1 SHUTDOWN & ISOLATION RE-AUDIT',
      energy_source: 'Pneumatic Pressure & Toxic Chemical Energy',
      barrier_status: 'DOUBLE BLOCK & BLEED BARRIER DEGRADED',
      key_learnings: 'Double block and bleed integrity must be pressure-monitored on digital gauges before mechanical intervention.'
    },
    {
      id: 104,
      report_reference: 'SR-CRIT-2026-04',
      report_type: 'Unsafe Condition',
      title: 'Missing Walkway Grating Void Above Hydrocarbon Separator Level 3',
      description: 'Open void (1.5m x 0.8m) left unprotected on elevated process walkway 8.5 meters above concrete ground. No perimeter tape, hard barrier, or safety harness warning installed during night maintenance.',
      location: 'Plant 02 • Separation Unit',
      facility_unit: 'Level 3 Elevated Walkway',
      report_date: '2026-09-04',
      sif_potential: 'FATAL FALL FROM HEIGHT POTENTIAL (88%)',
      ai_confidence: 93.1,
      risk_score: 86,
      investigation_priority: 'P2 HIGH EXPEDITED CLOSURE',
      energy_source: 'Gravitational Fall Potential',
      barrier_status: 'PHYSICAL WALKWAY BARRIER REMOVED',
      key_learnings: 'Grating removal permits must strictly enforce physical perimeter cage installation before removal begins.'
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto text-slate-800 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-stone-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-50 border border-rose-200/60 text-rose-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 tracking-tight">
              Strong Reports &amp; Critical Precursors
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Top-ranked high-value observations with acute Serious Injury &amp; Fatality potential requiring chief executive review
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
            4 Critical Priority Events
          </span>
        </div>
      </div>

      {/* Deep Dive Cards */}
      <div className="space-y-6">
        {strongReports.map((report) => (
          <div 
            key={report.id}
            className="rounded-2xl bg-white border border-[#EAE6E1] hover:border-orange-300 p-6 shadow-sm space-y-5 transition-all duration-300 text-slate-800"
          >
            
            {/* Top Bar with Priority & AI Scores */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-mono text-xs font-bold text-[#FF5A36] bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200/60">
                  {report.report_reference}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200/60">
                  {report.investigation_priority}
                </span>
                <span className="text-xs text-slate-500">
                  {report.location} • {report.report_date}
                </span>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Risk Score</span>
                  <div className="text-lg font-black font-mono text-rose-600">{report.risk_score} / 100</div>
                </div>
              </div>
            </div>

            {/* Headline & Description */}
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {report.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-2 bg-[#FBF9F6] p-3.5 rounded-xl border border-[#EAE6E1]">
                {report.description}
              </p>
            </div>

            {/* Key Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-[#FBF9F6] border border-[#EAE6E1] space-y-1">
                <span className="text-[10px] font-bold text-rose-600 uppercase font-mono flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  High-Energy Vector
                </span>
                <div className="text-xs font-medium text-slate-800">{report.energy_source}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FBF9F6] border border-[#EAE6E1] space-y-1">
                <span className="text-[10px] font-bold text-[#FF5A36] uppercase font-mono flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  Barrier Integrity State
                </span>
                <div className="text-xs font-medium text-slate-800">{report.barrier_status}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FBF9F6] border border-[#EAE6E1] space-y-1">
                <span className="text-[10px] font-bold text-purple-600 uppercase font-mono flex items-center gap-1">
                  <AlertOctagon className="w-3 h-3" />
                  SIF Consequence Potential
                </span>
                <div className="text-xs font-medium text-rose-600 font-semibold">{report.sif_potential}</div>
              </div>
            </div>

            {/* Bottom Action */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-end text-xs">
              <button
                type="button"
                onClick={() => setSelectedReport(report)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF6B4A] to-[#FF5A36] hover:from-[#ff5934] hover:to-[#e64a27] text-white font-bold text-xs shadow-md shadow-orange-500/20 shrink-0 cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <span>Examine SIF Barrier Dossier</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        ))}
      </div>

      {selectedReport && (
        <FullAnalysisModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}

    </div>
  );
}
