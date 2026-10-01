import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  ArrowRight, 
  ShieldAlert, 
  ShieldCheck, 
  HelpCircle, 
  Send, 
  CheckCircle2, 
  History, 
  Inbox,
  Calendar,
  MapPin
} from 'lucide-react';
import { api } from '../../services/api';

export default function ReviewFeedbackView({ onSelectReport }) {
  const [pendingReports, setPendingReports] = useState([]);
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('pending'); // 'pending' | 'history'
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pending, history] = await Promise.all([
        api.getPendingReviewReports(),
        api.getAllFeedback()
      ]);
      setPendingReports(pending || []);
      setFeedbackHistory(history || []);
    } catch (err) {
      setError(err.message || 'Failed to load review queue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Sub Header & Switcher */}
      <div className="bg-[#0C1425] p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white font-heading">
            Human-in-the-Loop AI Validation Queue
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Validate AI SIF Precursor findings to maintain safety engineering rigor and audit compliance.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveSubTab('pending')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'pending'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending Review ({pendingReports.length})
          </button>
          
          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'history'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Audit History ({feedbackHistory.length})
          </button>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span className="text-xs text-slate-400 font-mono">Loading review validation queue...</span>
        </div>
      ) : error ? (
        <div className="p-6 text-center text-xs text-rose-400">
          {error}
        </div>
      ) : activeSubTab === 'pending' ? (
        pendingReports.length === 0 ? (
          <div className="p-16 text-center bg-[#0C1425] rounded-2xl border border-slate-800 space-y-3">
            <CheckSquare className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-white font-heading">
              All Analyzed Reports Reviewed
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No reports currently require review. Every completed AI analysis has received human validation.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingReports.map((r) => (
              <div
                key={r.id}
                onClick={() => onSelectReport(r.id)}
                className="bg-[#0C1425] hover:bg-[#101a30] p-5 rounded-2xl border border-slate-800/90 transition-all cursor-pointer group flex flex-col justify-between space-y-4 shadow-lg hover:border-emerald-700/50"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {r.report_reference}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                      Pending Expert Review
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 font-medium line-clamp-2 leading-relaxed">
                    {r.description}
                  </p>

                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {r.location}
                    </span>
                    <span>{r.report_date}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">
                    SIF Assessment: <strong className="text-slate-200">{r.sif_precursor_assessment || 'COMPLETED'}</strong>
                  </span>
                  <span className="text-emerald-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 font-bold">
                    <span>Perform Review</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* History Subtab */
        feedbackHistory.length === 0 ? (
          <div className="p-16 text-center bg-[#0C1425] rounded-2xl border border-slate-800 space-y-3">
            <History className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white font-heading">
              No Feedback History
            </h3>
            <p className="text-xs text-slate-400">
              No human reviews have been submitted yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {feedbackHistory.map((fb) => (
              <div
                key={fb.id}
                onClick={() => onSelectReport(fb.report_id)}
                className="bg-[#0C1425] hover:bg-[#101a30] p-4 rounded-xl border border-slate-800 text-xs transition-colors cursor-pointer group flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {fb.feedback_status}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      Report ID #{fb.report_id}
                    </span>
                  </div>
                  {fb.feedback_text ? (
                    <p className="text-slate-300 text-xs mt-1">
                      "{fb.feedback_text}"
                    </p>
                  ) : (
                    <p className="text-slate-500 italic text-xs">
                      No additional remarks provided.
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0 text-[10px] text-slate-500 font-mono">
                  {new Date(fb.created_at).toLocaleDateString()}
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all mt-1 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        )
      )}

    </div>
  );
}
