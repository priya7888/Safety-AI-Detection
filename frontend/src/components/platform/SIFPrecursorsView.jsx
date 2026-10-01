import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Clock, 
  Layers, 
  Activity, 
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
  Search,
  RefreshCw,
  Info,
  ChevronRight,
  UserCheck,
  MessageSquare,
  Sparkles,
  Filter,
  Check,
  ExternalLink,
  X,
  Database,
  ArrowDown,
  Edit3,
  Sliders,
  Shield,
  SlidersHorizontal,
  HelpCircle,
  AlertOctagon,
  Lock,
  UploadCloud,
  Trash2
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip
} from 'recharts';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import FullAnalysisModal from './FullAnalysisModal';
import { 
  getStoreState, 
  updatePrecursorStatus as storeUpdatePrecursorStatus, 
  updatePrecursorDetails as storeUpdatePrecursorDetails, 
  subscribeSafetyStore, 
  clearAllSafetyData 
} from '../../services/safetyStore';

// Storage key for admin precursor modifications
const ADMIN_PRECURSORS_STORAGE_KEY = 'safetyai_admin_precursors_data';

// Default baseline precursors (clean slate: zero operational records)
const DEFAULT_PRECURSORS = [];

export default function SIFPrecursorsView({ onNavigate }) {
  const { user } = useAuth();
  const isAdmin = Boolean(
    (user?.is_admin || 
     user?.role === 'ADMINISTRATOR' || 
     user?.role === 'CHIEF_HSE_AUDITOR' ||
     user?.role_name === 'Administrator' || 
     (user?.email && user.email.toLowerCase().includes('admin'))) &&
    user?.role !== 'NORMAL_USER' &&
    !user?.email?.toLowerCase().includes('user')
  );

  // Main data states
  const [loading, setLoading] = useState(true);
  const [precursors, setPrecursors] = useState([]);
  const [dashboardMetrics, setDashboardMetrics] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [scopeFilter, setScopeFilter] = useState('ALL'); // 'ALL' | 'WANTS_FEEDBACK' | 'ACTIVE_WEAK_SIGNALS' | 'COMPLETE'

  // Edit Modal State
  const [editingPrecursor, setEditingPrecursor] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    category: 'Lifting Operations & Rigging',
    unit: 'Unit 1',
    isSIF: true,
    risk_score: 85,
    status: 'Under Review',
    short_description: '',
    engineering_mandate: '',
    reviewer_notes: ''
  });

  // Detailed Analysis Dossier Modal
  const [selectedDossierReport, setSelectedDossierReport] = useState(null);

  // Reset baseline confirmation modal states
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState(null);

  // Load precursors from safetyStore / backend
  const loadPrecursors = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      
      const [backendPrecursors, backendMetrics] = await Promise.all([
        api.getSIFPrecursors(),
        api.getDashboardData()
      ]);
      setPrecursors(Array.isArray(backendPrecursors) ? backendPrecursors : []);
      setDashboardMetrics(backendMetrics || null);
    } catch (err) {
      console.error('Error loading precursors:', err);
      const storeState = getStoreState();
      if (storeState.isWiped) {
        setPrecursors([]);
      } else {
        const localData = localStorage.getItem(ADMIN_PRECURSORS_STORAGE_KEY);
        try {
          const loadedList = localData ? JSON.parse(localData) : storeState.precursors || [];
          setPrecursors(Array.isArray(loadedList) ? loadedList : []);
        } catch {
          setPrecursors(storeState.precursors || []);
        }
      }
      setFetchError('Failed to load precursor intelligence records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrecursors();
    const unsubscribe = subscribeSafetyStore((newState) => {
      if (newState.isWiped) {
        setPrecursors([]);
      } else if (newState.precursors) {
        setPrecursors(newState.precursors);
      }
    });
    return unsubscribe;
  }, []);

  // Persist updated list to state & localStorage
  const updatePrecursorsList = (newList) => {
    setPrecursors(newList);
    localStorage.setItem(ADMIN_PRECURSORS_STORAGE_KEY, JSON.stringify(newList));
  };

  // Quick Status Toggle (Complete, Incomplete, Under Review)
  // RULE ENFORCEMENT:
  // "underview is changed to complete and complte cant be changes to nott completerd or under review"
  const handleQuickStatusChange = (precursorId, newStatus) => {
    // STRICT ROLE PERMISSION: Only Administrators can update precursor review status
    if (!isAdmin) {
      setToastMessage({
        type: 'error',
        text: 'Action Restricted: Only Administrators can update precursor review status.'
      });
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }

    const target = precursors.find(p => p.id === precursorId || p.precursor_id === precursorId);
    if (!target) return;

    // STRICT LOCK: If already Complete, cannot be changed back to Incomplete or Under Review!
    if (target.status === 'Complete') {
      setToastMessage({
        type: 'error',
        text: 'Action Locked: Completed records are finalized and cannot be changed back to Incomplete or Under Review.'
      });
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }

    try {
      storeUpdatePrecursorStatus(precursorId, newStatus);
      const updated = precursors.map((p) => {
        if (p.id === precursorId || p.precursor_id === precursorId) {
          return {
            ...p,
            status: newStatus,
            reviewed_at: new Date().toISOString()
          };
        }
        return p;
      });
      updatePrecursorsList(updated);
      setToastMessage({
        type: 'success',
        text: `Record status successfully updated to "${newStatus}". Synced to audit log.`
      });
    } catch (err) {
      setToastMessage({
        type: 'error',
        text: err.message || 'Status transition blocked.'
      });
    }
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Open Edit Modal for a Precursor
  const handleOpenEdit = (p) => {
    if (!isAdmin) {
      setToastMessage({
        type: 'error',
        text: 'Action Restricted: Only Administrators can edit precursor intelligence records.'
      });
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }
    setEditingPrecursor(p);
    setEditForm({
      title: p.title || '',
      category: p.category || 'Lifting Operations & Rigging',
      unit: p.unit || 'Unit 1',
      isSIF: p.isSIF !== undefined ? p.isSIF : true,
      risk_score: p.risk_score || 85,
      status: p.status || 'Under Review',
      short_description: p.short_description || '',
      engineering_mandate: p.engineering_mandate || '',
      reviewer_notes: p.reviewer_notes || ''
    });
  };

  // Save Edit Changes
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!isAdmin) {
      setToastMessage({
        type: 'error',
        text: 'Action Restricted: Only Administrators can update precursor review status.'
      });
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }
    if (!editingPrecursor) return;

    // STRICT LOCK: Completed records cannot revert status
    if (editingPrecursor.status === 'Complete' && editForm.status !== 'Complete') {
      setToastMessage({
        type: 'error',
        text: 'Audit Lock: Completed findings are finalized and cannot be reverted to Incomplete or Under Review.'
      });
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }

    const newStatus = editingPrecursor.status === 'Complete' ? 'Complete' : editForm.status;

    const updated = precursors.map((p) => {
      if (p.id === editingPrecursor.id || p.precursor_id === editingPrecursor.precursor_id) {
        return {
          ...p,
          title: editForm.title,
          category: editForm.category,
          unit: editForm.unit,
          isSIF: Boolean(editForm.isSIF),
          risk_score: Number(editForm.risk_score),
          status: newStatus,
          short_description: editForm.short_description,
          engineering_mandate: editForm.engineering_mandate,
          reviewer_notes: editForm.reviewer_notes,
          reviewed_at: new Date().toISOString()
        };
      }
      return p;
    });

    updatePrecursorsList(updated);
    setEditingPrecursor(null);
    setToastMessage({
      type: 'success',
      text: `Changes saved for "${editForm.title}". Score set to ${editForm.risk_score}, SIF: ${editForm.isSIF ? 'YES' : 'NO'}.`
    });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Trigger confirmation modal for Reset Baseline
  const handleResetData = () => {
    if (!isAdmin) {
      setToastMessage({
        type: 'error',
        text: 'Action Restricted: Only Administrators can reset enterprise baseline data.'
      });
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }
    setShowResetConfirmModal(true);
  };

  // Execute full baseline wipe across backend DB and frontend store upon confirmation
  const executeResetBaseline = async () => {
    setIsResetting(true);
    try {
      // 1. Wipe all operational data in localStorage and backend database
      await clearAllSafetyData();

      // 2. Ensure all precursor and admin keys are cleared
      localStorage.removeItem(ADMIN_PRECURSORS_STORAGE_KEY);
      localStorage.removeItem('safetyai_active_reports');
      localStorage.removeItem('safetyai_admin_precursors_data');
      localStorage.removeItem('safetyai_weak_signals_data');
      localStorage.removeItem('SAFETY_TOTAL_REPORTS_V3');
      localStorage.removeItem('safetyai_admin_precursors_v2');

      // 3. Clear local state
      updatePrecursorsList([]);
      setShowResetConfirmModal(false);

      setToastMessage({
        type: 'success',
        text: 'Baseline successfully reset! All operational reports, precursor findings, and static data wiped across Admin & User dashboards.'
      });
      setTimeout(() => setToastMessage(null), 4500);
    } catch (err) {
      console.error('Reset baseline error:', err);
      setToastMessage({
        type: 'error',
        text: 'Failed to reset baseline completely. Please try again.'
      });
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsResetting(false);
    }
  };

  // ================= METRICS COMPUTATION =================
  // 1. How many still want human feedback (Pending / Under Review OR Incomplete)
  const wantsHumanFeedbackList = precursors.filter(
    (p) => p.status === 'Under Review' || p.status === 'Incomplete'
  );

  // 2. Active weak signals consideration: strictly consider Pending & Incomplete
  const activeWeakSignalsScopeList = precursors.filter(
    (p) => p.status === 'Under Review' || p.status === 'Incomplete'
  );

  // 3. Completed precursors
  const completedList = precursors.filter((p) => p.status === 'Complete');

  // 4. Confirmed SIF Precursors count
  const sifCount = precursors.filter((p) => p.isSIF).length;
  const totalSifPrecursors = dashboardMetrics?.total_sif_precursors ?? sifCount;
  const awaitingHumanFeedback = dashboardMetrics?.sif_precursors_awaiting_review ?? wantsHumanFeedbackList.length;
  const completedSifPrecursors = dashboardMetrics?.sif_precursors_completed ?? completedList.length;

  // Filtered List for Display
  const displayedPrecursors = precursors.filter((p) => {
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = (p.title || '').toLowerCase().includes(q) ||
                    (p.category || '').toLowerCase().includes(q) ||
                    (p.precursor_id || '').toLowerCase().includes(q) ||
                    (p.unit || '').toLowerCase().includes(q) ||
                    (p.engineering_mandate || '').toLowerCase().includes(q);
      if (!match) return false;
    }

    // Scope tab match
    if (scopeFilter === 'WANTS_FEEDBACK') {
      return p.status === 'Under Review' || p.status === 'Incomplete';
    }
    if (scopeFilter === 'ACTIVE_WEAK_SIGNALS') {
      // By analyzing weak signals only consider pending and incomplete
      return p.status === 'Under Review' || p.status === 'Incomplete';
    }
    if (scopeFilter === 'COMPLETE') {
      return p.status === 'Complete';
    }

    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto text-slate-800 animate-in fade-in duration-200 select-none">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm animate-in slide-in-from-top duration-300 ${
          toastMessage.type === 'success' 
            ? 'bg-slate-900 text-white border-[#FF5A36]' 
            : 'bg-rose-900 text-white border-rose-700'
        }`}>
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-[#FF5A36]" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-300" />
          )}
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#EAE6E1]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#FFF1EE] border border-[#FFE0D6] flex items-center justify-center text-[#FF5A36] shadow-xs">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 tracking-tight flex items-center gap-2">
                <span>{isAdmin ? 'Admin Safety Intelligence & SIF Command Center' : 'Safety Intelligence & SIF Precursor Registry'}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                  isAdmin ? 'bg-slate-900 text-white' : 'bg-sky-100 text-sky-800'
                }`}>
                  {isAdmin ? 'Admin Authority' : 'Standard Read Access'}
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {isAdmin
                  ? 'Audit, govern, mark complete/incomplete, re-score, toggle SIF/Non-SIF, and analyze weak signals across operating units.'
                  : 'Monitor verified precursors, audit telemetry, and analyze weak signals across operating units.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Reset Baseline - Administrator Only */}
          {isAdmin && (
            <button
              type="button"
              onClick={handleResetData}
              title="Reset dataset to baseline"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#EAE6E1] text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Baseline</span>
            </button>
          )}
        </div>
      </div>

      {fetchError && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>{fetchError}</span>
        </div>
      )}

      {/* ================= 1. DYNAMIC KPI CARDS (INCLUDING "HOW MANY STILL WANT HUMAN FEEDBACK") ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 1: WANTS HUMAN FEEDBACK (HIGHLIGHTED) */}
        <div 
          onClick={() => setScopeFilter('WANTS_FEEDBACK')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs flex flex-col justify-between ${
            scopeFilter === 'WANTS_FEEDBACK'
              ? 'bg-gradient-to-br from-[#FFF5F2] to-white border-[#FF5A36] ring-2 ring-orange-400/20'
              : 'bg-white border-[#EAE6E1] hover:border-orange-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FF5A36] animate-pulse" />
              Wants Human Feedback
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FFF1EE] text-[#FF5A36] flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-[#FF5A36] font-heading tracking-tight flex items-baseline gap-2">
              <span>{awaitingHumanFeedback}</span>
              <span className="text-xs font-semibold text-slate-400 font-sans">
                findings awaiting sign-off
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-normal">
              Precursor findings currently pending human review or incomplete
            </p>
          </div>
        </div>

        {/* Card 2: Total SIF Precursors */}
        <div 
          onClick={() => setScopeFilter('ALL')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs flex flex-col justify-between ${
            scopeFilter === 'ALL'
              ? 'bg-gradient-to-br from-slate-50 to-white border-slate-900 ring-2 ring-slate-400/20'
              : 'bg-white border-[#EAE6E1] hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Total SIF Precursors
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 font-heading tracking-tight">
              {totalSifPrecursors} <span className="text-xs font-mono font-medium text-slate-400">/ {dashboardMetrics?.total_reports ?? precursors.length} Total</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-normal">
              High-potential fatality precursors flagged across operations
            </p>
          </div>
        </div>

        {/* Card 3: Complete / Resolved Findings */}
        <div 
          onClick={() => setScopeFilter('COMPLETE')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs flex flex-col justify-between ${
            scopeFilter === 'COMPLETE'
              ? 'bg-gradient-to-br from-emerald-50/50 to-white border-emerald-500 ring-2 ring-emerald-400/20'
              : 'bg-white border-[#EAE6E1] hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Marked as Complete
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-emerald-600 font-heading tracking-tight">
              {completedSifPrecursors}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-normal">
              Verified & resolved with engineering controls deployed
            </p>
          </div>
        </div>

      </div>

      {/* ================= 2. ACTIVE WEAK SIGNALS SCOPE BANNER ================= */}
      {scopeFilter === 'ACTIVE_WEAK_SIGNALS' && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300/80 flex items-center justify-between gap-4 text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5 text-amber-950 font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Weak Signals Analysis Active Scope:</strong> Analyzing weak signals by strictly considering <strong>Pending</strong> review and <strong>Incomplete</strong> findings to isolate unresolved hazard patterns before they escalate.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setScopeFilter('ALL')}
            className="px-3 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 font-bold hover:bg-amber-100 transition-colors shrink-0"
          >
            Show All Scope
          </button>
        </div>
      )}

      {/* ================= 3. FILTER BAR & SEARCH ================= */}
      <div className="rounded-2xl bg-white border border-[#EAE6E1] p-5 shadow-sm space-y-4 text-slate-800">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Precursor ID, title, category, or unit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FBF9F6] border border-stone-200 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#FF5A36] transition-all"
            />
          </div>

          {/* Quick Scope Filter Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setScopeFilter('ALL')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                scopeFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-[#FBF9F6] border border-stone-200 text-slate-700 hover:bg-stone-100'
              }`}
            >
              All Records ({precursors.length})
            </button>

            <button
              type="button"
              onClick={() => setScopeFilter('WANTS_FEEDBACK')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                scopeFilter === 'WANTS_FEEDBACK'
                  ? 'bg-[#FF5A36] text-white shadow-xs'
                  : 'bg-[#FFF1EE] border border-[#FFE0D6] text-[#FF5A36] hover:bg-orange-100/70'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Wants Feedback ({wantsHumanFeedbackList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setScopeFilter('ACTIVE_WEAK_SIGNALS')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                scopeFilter === 'ACTIVE_WEAK_SIGNALS'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Pending &amp; Incomplete Weak Signals ({activeWeakSignalsScopeList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setScopeFilter('COMPLETE')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                scopeFilter === 'COMPLETE'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Complete ({completedList.length})</span>
            </button>
          </div>

        </div>
      </div>

      {/* ================= 4. PRECURSORS & WEAK SIGNALS CARD LIST (EXACT WEAK SIGNALS FORMAT) ================= */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-[#EAE6E1] text-xs text-slate-500">
            <RefreshCw className="w-6 h-6 text-[#FF5A36] animate-spin mx-auto mb-2" />
            Loading precursor intelligence records...
          </div>
        ) : precursors.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border-2 border-dashed border-stone-200 text-xs text-slate-500 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF5A36] flex items-center justify-center mx-auto border border-orange-200">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="font-bold text-slate-800 text-base">No SIF Precursors Logged Yet</p>
            <p className="text-slate-500 max-w-md mx-auto text-xs">
              Upload your incident register or observation spreadsheet via <strong>Bulk Upload</strong> to initiate autonomous AI precursor detection starting from today.
            </p>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('/bulk-upload')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF5A36] hover:bg-[#e64a27] text-white text-xs font-bold shadow-md cursor-pointer transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Go to Bulk Safety Ingestion</span>
            </button>
          </div>
        ) : displayedPrecursors.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-[#EAE6E1] text-xs text-slate-500 space-y-2">
            <p className="font-semibold text-slate-700 text-sm">No precursor records found matching your filter criteria.</p>
            <p className="text-slate-400">Try adjusting your search query or reset the filter tabs.</p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setScopeFilter('ALL'); }}
              className="mt-2 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          displayedPrecursors.map((p) => {
            const isComplete = p.status === 'Complete';
            const isIncomplete = p.status === 'Incomplete';
            const isUnderReview = p.status === 'Under Review' || (!isComplete && !isIncomplete);

            return (
              <div 
                key={p.precursor_id || p.id}
                className="rounded-2xl bg-white border border-[#EAE6E1] hover:border-orange-300 p-6 shadow-sm space-y-4 transition-all duration-300 text-slate-800"
              >
                {/* Header Row: Badges & Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-lg">
                      {p.precursor_id}
                    </span>

                    {/* SIF Status Badge (Editable) */}
                    {p.isSIF ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                        SIF Precursor
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Non-SIF Routine Observation
                      </span>
                    )}

                    {/* Status Badge: Complete / Incomplete / Under Review */}
                    {isComplete ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" />
                        Complete
                      </span>
                    ) : isIncomplete ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                        <X className="w-3 h-3 text-rose-600" />
                        Incomplete (Action Needed)
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Under Review (Wants Feedback)
                      </span>
                    )}

                    {/* Risk Score */}
                    <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                      p.risk_score >= 80 
                        ? 'bg-rose-100 text-rose-800' 
                        : p.risk_score >= 60 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      Score: {p.risk_score || 85}/100
                    </span>

                    {/* Unit Tag */}
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-stone-100 text-slate-700">
                      {p.unit || 'Unit 1'}
                    </span>
                  </div>

                  {/* Top Right: Edit Precursor button (Admin Only) */}
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(p)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#FF5A36]" />
                      <span>Edit Record</span>
                    </button>
                  )}
                </div>

                {/* Headline Title & Action Button (Exact Weak Signals Format) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
                    {p.title}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSelectedDossierReport({
                      id: p.id,
                      report_reference: p.precursor_id,
                      identified_hazard: p.title,
                      statement: p.short_description,
                      recommended_action: p.engineering_mandate,
                      energy_source: p.category,
                      sif_precursor_assessment: p.isSIF ? 'YES' : 'NO',
                      isSIF: Boolean(p.isSIF),
                      risk_level: p.risk_score >= 80 ? 'Critical' : 'High',
                      location: p.unit || 'Operating Unit',
                      report_type: 'SIF Precursor Record',
                      report_date: p.detection_date || '2026-09-08'
                    })}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF6B4A] to-[#FF5A36] hover:from-[#ff5934] hover:to-[#e64a27] text-white font-bold text-xs shadow-md shadow-orange-500/20 shrink-0 cursor-pointer flex items-center gap-1.5 transition-all self-start sm:self-auto"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Quick Status Change Controls */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-end">
                  {/* 1-Click Status Toggles: Admin Only. Read-Only Locked Status for Normal Users */}
                  {isAdmin ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] text-slate-400 uppercase font-mono mr-1">
                        {isComplete ? 'Audit:' : 'Mark:'}
                      </span>
                      
                      <button
                        type="button"
                        onClick={() => !isComplete && handleQuickStatusChange(p.id, 'Complete')}
                        disabled={isComplete}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                          isComplete
                            ? 'bg-emerald-600 text-white shadow-xs cursor-default'
                            : 'bg-stone-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-stone-200 cursor-pointer'
                        }`}
                        title={isComplete ? "Audit Finalized: Completed status is locked" : "Mark finding as Complete"}
                      >
                        <Check className="w-3 h-3" />
                        <span>{isComplete ? 'Complete (Locked)' : 'Complete'}</span>
                      </button>

                      <button
                        type="button"
                        disabled={isComplete}
                        onClick={() => handleQuickStatusChange(p.id, 'Incomplete')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                          isComplete
                            ? 'opacity-35 cursor-not-allowed bg-stone-100 text-slate-400 border border-stone-200'
                            : isIncomplete
                            ? 'bg-rose-600 text-white shadow-xs cursor-pointer'
                            : 'bg-stone-50 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-stone-200 cursor-pointer'
                        }`}
                        title={isComplete ? "Finalized: Completed records cannot be changed back to Incomplete" : "Mark finding as Incomplete / Action Required"}
                      >
                        <X className="w-3 h-3" />
                        <span>Incomplete</span>
                      </button>

                      <button
                        type="button"
                        disabled={isComplete}
                        onClick={() => handleQuickStatusChange(p.id, 'Under Review')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                          isComplete
                            ? 'opacity-35 cursor-not-allowed bg-stone-100 text-slate-400 border border-stone-200'
                            : isUnderReview
                            ? 'bg-amber-600 text-white shadow-xs cursor-pointer'
                            : 'bg-stone-50 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-stone-200 cursor-pointer'
                        }`}
                        title={isComplete ? "Finalized: Completed records cannot be changed back to Under Review" : "Hold for Under Review"}
                      >
                        <Clock className="w-3 h-3" />
                        <span>Under Review</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto px-3 py-1.5 rounded-lg bg-stone-100 border border-stone-200 text-slate-600 text-xs">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Review Status:</span>
                      <span className={`font-bold ${
                        isComplete ? 'text-emerald-700' : isIncomplete ? 'text-rose-700' : 'text-amber-700'
                      }`}>
                        {p.status || 'Under Review'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium italic">(Admin Only)</span>
                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* ================= EDIT PRECURSOR MODAL (ADMIN ONLY) ================= */}
      {isAdmin && editingPrecursor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200 select-none">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#EAE6E1] overflow-hidden flex flex-col max-h-[92vh] text-left text-slate-800 animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 bg-[#FAF8F5] border-b border-[#EAE6E1] flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#FFF1EE] text-[#FF5A36] border border-[#FFE0D6]">
                    {editingPrecursor.precursor_id}
                  </span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Admin Record Override
                  </span>
                </div>
                <h3 className="text-xl font-bold font-heading text-slate-900 tracking-tight mt-1">
                  Edit Precursor &amp; Classification
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setEditingPrecursor(null)}
                className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-[#EAE6E1] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto space-y-5 text-xs">
              
              {/* Title Input */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block uppercase tracking-wider text-[11px]">
                  Precursor / Hazard Title
                </label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-slate-900 font-semibold focus:outline-none focus:border-[#FF5A36] text-xs bg-[#FAF8F5] focus:bg-white transition-all"
                />
              </div>

              {/* SIF Status Toggle (SIF vs Non-SIF) */}
              <div className="space-y-1.5 p-4 rounded-xl border border-stone-200 bg-[#FAF8F5]">
                <label className="font-bold text-slate-800 block uppercase tracking-wider text-[11px]">
                  SIF Classification (Toggle SIF to Non-SIF)
                </label>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, isSIF: true })}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                      editForm.isSIF
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-white text-slate-700 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>SIF Precursor (High Threat)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, isSIF: false })}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                      !editForm.isSIF
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-slate-700 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Non-SIF Routine Observation</span>
                  </button>
                </div>
              </div>

              {/* Risk Score Slider & Input */}
              <div className="space-y-2 p-4 rounded-xl border border-stone-200 bg-[#FAF8F5]">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    Risk Score (0 - 100)
                  </label>
                  <span className={`text-base font-black font-mono px-3 py-0.5 rounded-lg ${
                    editForm.risk_score >= 80 ? 'bg-rose-100 text-rose-800' :
                    editForm.risk_score >= 60 ? 'bg-amber-100 text-amber-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {editForm.risk_score}/100
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editForm.risk_score}
                  onChange={(e) => setEditForm({ ...editForm, risk_score: e.target.value })}
                  className="w-full accent-[#FF5A36] cursor-pointer"
                />
              </div>

              {/* Status Selector: Complete, Incomplete, Under Review */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block uppercase tracking-wider text-[11px]">
                  Audit Status
                </label>
                {editingPrecursor.status === 'Complete' ? (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 flex items-center gap-2.5">
                    <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold block">Status: Complete (Finalized & Locked)</span>
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        This record has been signed off as Complete. Per audit governance, finalized findings cannot be moved back to Incomplete or Under Review.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {['Complete', 'Incomplete', 'Under Review'].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setEditForm({ ...editForm, status })}
                        className={`py-2 px-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer text-center border ${
                          editForm.status === status
                            ? status === 'Complete' ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : status === 'Incomplete' ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                              : 'bg-amber-600 text-white border-amber-600 shadow-sm'
                            : 'bg-white text-slate-700 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Category & Operating Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block uppercase tracking-wider text-[10.5px]">
                    Hazard Category
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-xs text-slate-800 bg-white"
                  >
                    <option value="Lifting Operations & Rigging">Lifting Operations &amp; Rigging</option>
                    <option value="Hazardous Energy & LOTO">Hazardous Energy &amp; LOTO</option>
                    <option value="Confined Space Entry">Confined Space Entry</option>
                    <option value="Work at Height">Work at Height</option>
                    <option value="Pressure & Hazardous Energy">Pressure &amp; Hazardous Energy</option>
                    <option value="Hot Work & Fire Safety">Hot Work &amp; Fire Safety</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block uppercase tracking-wider text-[10.5px]">
                    Operating Unit
                  </label>
                  <select
                    value={editForm.unit}
                    onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-xs text-slate-800 bg-white"
                  >
                    <option value="Unit 1">Unit 1 (Process Refining)</option>
                    <option value="Unit 2">Unit 2 (Compressor Station)</option>
                    <option value="Unit 3">Unit 3 (LPG Storage Farm)</option>
                    <option value="Unit 4">Unit 4 (Offsite Pipeline)</option>
                  </select>
                </div>
              </div>

              {/* Prescribed Controls & Corrective Action Textarea */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block uppercase tracking-wider text-[11px]">
                  Prescribed Controls &amp; Corrective Action
                </label>
                <textarea
                  rows={3}
                  required
                  value={editForm.engineering_mandate}
                  onChange={(e) => setEditForm({ ...editForm, engineering_mandate: e.target.value })}
                  placeholder="Enter mandatory barrier and engineering directives..."
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-xs text-slate-800 leading-relaxed bg-[#FAF8F5] focus:bg-white focus:outline-none focus:border-[#FF5A36]"
                />
              </div>

              {/* Review Notes Textarea */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block uppercase tracking-wider text-[11px]">
                  Admin Review Audit Feedback
                </label>
                <textarea
                  rows={2}
                  value={editForm.reviewer_notes}
                  onChange={(e) => setEditForm({ ...editForm, reviewer_notes: e.target.value })}
                  placeholder="Notes explaining confirmation, score adjustments, or barrier deployment..."
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-xs text-slate-800 leading-relaxed bg-[#FAF8F5] focus:bg-white focus:outline-none focus:border-[#FF5A36]"
                />
              </div>

              {/* Form Footer Actions */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPrecursor(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-stone-300 text-slate-700 hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#FF6B4A] to-[#FF5A36] text-white hover:from-[#ff5934] hover:to-[#e64a27] shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  Save Record Changes
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ================= RESET BASELINE CONFIRMATION POPUP MODAL ================= */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold font-heading text-slate-900">
                  Reset Platform Baseline?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to reset all data? This action will permanently wipe all operational safety observations, AI analyses, SIF precursor findings, and weak signals across <strong>both Admin and User dashboards</strong>.
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-[11px] text-amber-800 flex items-center gap-2">
              <span className="font-bold shrink-0">⚠ Warning:</span>
              <span>All active reports, metrics, charts, and stored records will return to a clean zero-baseline cold start.</span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-100">
              <button
                type="button"
                disabled={isResetting}
                onClick={() => setShowResetConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isResetting}
                onClick={executeResetBaseline}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 rounded-xl shadow-md shadow-rose-600/20 transition-all cursor-pointer"
              >
                {isResetting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Wiping Baseline Data...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Reset All Data</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= FULL ANALYSIS DOSSIER MODAL ================= */}
      {selectedDossierReport && (
        <FullAnalysisModal
          report={selectedDossierReport}
          onClose={() => setSelectedDossierReport(null)}
        />
      )}

    </div>
  );
}
