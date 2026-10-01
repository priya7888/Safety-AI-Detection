import React, { useState } from 'react';
import TopNavbar from './TopNavbar';
import DashboardView from './DashboardView';
import SubmitReportView from './SubmitReportView';
import SafetyReportsView from './SafetyReportsView';
import AIAnalysisView from './AIAnalysisView';
import BulkUploadView from './BulkUploadView';
import AllReportsView from './AllReportsView';
import SIFIntelligenceView from './SIFIntelligenceView';
import ReviewFeedbackView from './ReviewFeedbackView';
import FullAnalysisModal from './FullAnalysisModal';

export default function OrganizationPlatform() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSymbols, setShowSymbols] = useState(false);
  const [selectedReportForModal, setSelectedReportForModal] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSelectReport = (report) => {
    setSelectedReportForModal(report);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleReportCreated = (newReportId) => {
    handleRefresh();
    setActiveTab('all_reports');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative overflow-x-hidden text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      
      {/* Ambient Radial Gradient Glow Orbs for Glassmorphism Depth */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[650px] h-[650px] rounded-full bg-blue-500/8 blur-[120px]" />
        <div className="absolute top-1/3 -left-32 w-[600px] h-[600px] rounded-full bg-indigo-500/8 blur-[130px]" />
        <div className="absolute -bottom-40 right-1/4 w-[700px] h-[700px] rounded-full bg-sky-400/10 blur-[140px]" />
      </div>

      {/* 1. Top Horizontal Navigation Bar */}
      <TopNavbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        showSymbols={showSymbols}
        setShowSymbols={setShowSymbols}
      />

      {/* 2. Full-Width Main Content View Routing */}
      <main className="flex-1 pb-16 relative z-10">
        {activeTab === 'dashboard' && (
          <DashboardView 
            key={refreshKey}
            onSelectReport={handleSelectReport}
            onOpenSafetyReports={() => setActiveTab('all_reports')}
            onOpenAIAnalysis={() => setActiveTab('ai_analysis')}
            showSymbols={showSymbols}
            setShowSymbols={setShowSymbols}
          />
        )}

        {activeTab === 'ai_analysis' && (
          <AIAnalysisView 
            onSelectReport={handleSelectReport}
          />
        )}

        {activeTab === 'bulk_upload' && (
          <BulkUploadView 
            onSelectReport={handleSelectReport}
            onOpenAllReports={() => setActiveTab('all_reports')}
          />
        )}

        {activeTab === 'all_reports' && (
          <AllReportsView 
            key={refreshKey}
            onSelectReport={handleSelectReport}
          />
        )}

        {activeTab === 'weak_signals' && (
          <SIFIntelligenceView 
            onSelectReport={handleSelectReport}
          />
        )}

        {activeTab === 'submit_report' && (
          <SubmitReportView 
            onReportCreated={handleReportCreated}
          />
        )}

        {activeTab === 'review_feedback' && (
          <ReviewFeedbackView 
            key={refreshKey}
            onSelectReport={handleSelectReport}
          />
        )}
      </main>

      {/* 3. Explainable Full AI Analysis Details Modal */}
      {selectedReportForModal && (
        <FullAnalysisModal 
          report={selectedReportForModal}
          onClose={() => setSelectedReportForModal(null)}
        />
      )}

    </div>
  );
}
