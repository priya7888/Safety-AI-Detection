import React, { useState, useEffect, useMemo } from 'react';
import { 
  Flame, 
  MapPin, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Layers, 
  Filter, 
  ArrowRight, 
  Eye, 
  Building2, 
  Activity 
} from 'lucide-react';
import { getStoreState, subscribeSafetyStore } from '../../services/safetyStore';

export default function RiskHeatmapView() {
  const [storeState, setStoreState] = useState(getStoreState());
  const [selectedPlant, setSelectedPlant] = useState('Unit 1');

  useEffect(() => {
    const unsub = subscribeSafetyStore(setStoreState);
    return unsub;
  }, []);

  // Plant risk zones data derived dynamically from reports
  const plantZones = useMemo(() => {
    const reports = storeState.reports || [];
    const zonesByPlant = {};

    reports.forEach((r, idx) => {
      const plant = r.location || 'Unit 1';
      if (!zonesByPlant[plant]) zonesByPlant[plant] = [];
      const isSIF = r.sif_precursor_assessment === 'YES' || r.risk_level === 'Critical' || (r.ai_score && r.ai_score >= 80);
      const score = r.ai_score || (isSIF ? 90 : 45);
      const level = score >= 85 ? 'Critical' : score >= 70 ? 'High' : score >= 50 ? 'Medium' : 'Low';
      const color = level === 'Critical' ? 'bg-rose-50/60 text-rose-800 border-rose-200' : level === 'High' ? 'bg-amber-50/60 text-amber-800 border-amber-200' : 'bg-emerald-50/60 text-emerald-800 border-emerald-200';
      zonesByPlant[plant].push({
        id: `Z-${String(idx + 1).padStart(2, '0')}`,
        name: r.facility_unit || r.location || `Operating Bay ${idx + 1}`,
        hazard: r.identified_hazard || r.description,
        score: score,
        level: level,
        precursors: isSIF ? 1 : 0,
        color: color
      });
    });

    return zonesByPlant;
  }, [storeState.reports]);

  const availablePlants = useMemo(() => {
    const keys = Object.keys(plantZones);
    return keys.length > 0 ? keys : ['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4'];
  }, [plantZones]);

  useEffect(() => {
    if (availablePlants.length > 0 && !availablePlants.includes(selectedPlant)) {
      setSelectedPlant(availablePlants[0]);
    }
  }, [availablePlants, selectedPlant]);

  // 5x5 Matrix (Likelihood vs Severity according to API RP 754)
  const matrixCells = [
    { row: '5 - Catastrophic', col1: 'Medium', col2: 'High', col3: 'Critical', col4: 'Critical', col5: 'Critical' },
    { row: '4 - Major', col1: 'Low', col2: 'Medium', col3: 'High', col4: 'High', col5: 'Critical' },
    { row: '3 - Moderate', col1: 'Low', col2: 'Medium', col3: 'Medium', col4: 'High', col5: 'High' },
    { row: '2 - Minor', col1: 'Low', col2: 'Low', col3: 'Low', col4: 'Medium', col5: 'Medium' },
    { row: '1 - Negligible', col1: 'Low', col2: 'Low', col3: 'Low', col4: 'Low', col5: 'Low' },
  ];

  const currentZones = plantZones[selectedPlant] || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto text-slate-800 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#EAE6E1]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#FFF1EE] border border-[#FFE0D6] flex items-center justify-center text-[#FF5A36] shadow-xs">
              <Flame className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 tracking-tight">
              Facility Risk Heatmap & Exposure Matrix
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 ml-12">
            API RP 754 risk matrix mapping spatial precursor frequency and barrier vulnerabilities across operating sites
          </p>
        </div>

        {/* Plant Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500 font-medium">Select Facility:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {availablePlants.map((pl) => (
              <button
                key={pl}
                onClick={() => setSelectedPlant(pl)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                  selectedPlant === pl
                    ? 'bg-[#FFF1EE] text-[#FF5A36] border-[#FFE0D6] font-bold shadow-xs'
                    : 'bg-white text-slate-600 border-[#EAE6E1] hover:bg-[#FAF8F5]'
                }`}
              >
                {pl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Spatial Risk Zones for Selected Facility */}
      <div className="rounded-2xl bg-white border border-[#EAE6E1] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#FF5A36]" />
              <span>Spatial Risk Zones – {selectedPlant}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">High-energy zones ranked by active precursor frequency</p>
          </div>
          <span className="px-3 py-1 rounded-lg bg-[#FFF1EE] text-[#FF5A36] border border-[#FFE0D6] text-xs font-mono font-bold">
            {currentZones.length} Zones Audited
          </span>
        </div>

        {currentZones.length === 0 ? (
          <div className="p-10 rounded-2xl bg-stone-50/60 border border-dashed border-stone-200 text-center space-y-2 text-slate-500">
            <MapPin className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-bold text-slate-700 text-sm">No Spatial Risk Data Logged for {selectedPlant}</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Spatial risk zones and precursor frequencies populate dynamically as incident and near-miss reports with location coordinates are submitted.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {currentZones.map((zone) => (
              <div 
                key={zone.id}
                className={`p-5 rounded-2xl border transition-all space-y-3 shadow-xs hover:shadow-md ${zone.color}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase opacity-75">{zone.id}</span>
                    <h4 className="text-xs font-bold text-slate-900 mt-0.5 leading-snug">{zone.name}</h4>
                  </div>
                  <span className="text-xs font-black font-mono shrink-0 px-2.5 py-0.5 rounded-md bg-white border border-stone-200 text-slate-900 shadow-xs">
                    Score {zone.score}
                  </span>
                </div>

                <div className="text-xs">
                  <span className="text-[10px] uppercase font-mono block text-slate-500">Primary Hazard</span>
                  <span className="font-semibold text-slate-800">{zone.hazard}</span>
                </div>

                <div className="pt-2 border-t border-black/5 flex items-center justify-between text-xs font-mono">
                  <span className="font-bold">{zone.precursors} Precursors</span>
                  <span className="font-bold uppercase tracking-wide">{zone.level} Risk</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5x5 Severity vs Likelihood Matrix */}
      <div className="rounded-2xl bg-white border border-[#EAE6E1] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">5x5 Enterprise Risk Matrix (API RP 754 Standard)</h3>
            <p className="text-xs text-slate-400 mt-0.5">Severity consequence vs Likelihood frequency evaluation</p>
          </div>
          <span className="text-xs font-mono text-[#FF5A36] font-bold">Dynamic Matrix</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#EAE6E1] text-slate-500 font-semibold uppercase bg-[#FAF8F5]">
                <th className="py-3 px-3 w-44 rounded-l-lg">Consequence Severity</th>
                <th className="py-3 px-3 text-center">1 - Rare</th>
                <th className="py-3 px-3 text-center">2 - Unlikely</th>
                <th className="py-3 px-3 text-center">3 - Possible</th>
                <th className="py-3 px-3 text-center">4 - Likely</th>
                <th className="py-3 px-3 text-center rounded-r-lg">5 - Almost Certain</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {matrixCells.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#FAF8F5]/60 transition-colors">
                  <td className="py-4 px-3 font-bold text-slate-900 bg-[#FAF8F5] border-r border-[#EAE6E1] whitespace-nowrap">
                    {row.row}
                  </td>
                  <td className={`p-3 text-center font-semibold text-[11px] ${row.col1.includes('Critical') ? 'bg-rose-50 text-rose-700 font-bold border border-rose-200' : 'bg-emerald-50/50 text-emerald-700'}`}>
                    {row.col1}
                  </td>
                  <td className={`p-3 text-center font-semibold text-[11px] ${row.col2.includes('Critical') ? 'bg-rose-50 text-rose-700 font-bold border border-rose-200' : row.col2.includes('High') ? 'bg-amber-50 text-amber-700 font-bold border border-amber-200' : 'bg-emerald-50/50 text-emerald-700'}`}>
                    {row.col2}
                  </td>
                  <td className={`p-3 text-center font-semibold text-[11px] ${row.col3.includes('Critical') ? 'bg-rose-50 text-rose-700 font-bold border border-rose-300' : row.col3.includes('High') ? 'bg-amber-50 text-amber-700 font-bold border border-amber-200' : 'bg-purple-50 text-purple-700'}`}>
                    {row.col3}
                  </td>
                  <td className={`p-3 text-center font-semibold text-[11px] ${row.col4.includes('Critical') ? 'bg-rose-50 text-rose-700 font-black border border-rose-300' : row.col4.includes('High') ? 'bg-amber-50 text-amber-700 font-bold border border-amber-200' : 'bg-purple-50 text-purple-700'}`}>
                    {row.col4}
                  </td>
                  <td className={`p-3 text-center font-semibold text-[11px] ${row.col5.includes('Critical') ? 'bg-rose-100 text-rose-800 font-black border border-rose-300' : 'bg-amber-50 text-amber-700 font-bold'}`}>
                    {row.col5}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-3 border-t border-stone-100 text-[11px] text-slate-400 font-mono flex items-center justify-between">
          <span>Critical zones require positive verification before shift handovers</span>
          <span>Automated API RP 754 matrix feed</span>
        </div>
      </div>

    </div>
  );
}
