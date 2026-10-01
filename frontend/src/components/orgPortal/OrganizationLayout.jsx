import React from 'react';
import OrganizationSidebar from './OrganizationSidebar';
import OrganizationHeader from './OrganizationHeader';
import OrganizationFooter from './OrganizationFooter';
import UploadReportModal from './common/UploadReportModal';
import ReportDetailModal from './common/ReportDetailModal';

export default function OrganizationLayout({
  children,
  activeTab,
  onSelectTab,
  onLogout,
  user,
  onAddReport,
  selectedReport,
  setSelectedReport,
  sifModalOpen,
  setSifModalOpen
}) {
  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-row font-sans antialiased selection:bg-amber-500 selection:text-slate-950 overflow-x-hidden">
      
      {/* 1. Master Left Navigation Sidebar */}
      <OrganizationSidebar 
        activeTab={activeTab} 
        onSelectTab={onSelectTab} 
        onLogout={onLogout} 
      />

      {/* 2. Main Content View Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#080b11]">
        
        {/* Top Header with Global Enterprise Identity and Controls */}
        <OrganizationHeader 
          user={user} 
          onLogout={onLogout} 
          onNavigate={onSelectTab}
        />

        {/* Page Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-[1680px] w-full mx-auto">
          {children}
        </main>

        {/* Bottom Operational Footer */}
        <OrganizationFooter onNavigate={onSelectTab} />

      </div>

      {/* 3. Log SIF Observation Modal (Triggered exclusively from SIF Intelligence page) */}
      <UploadReportModal
        isOpen={sifModalOpen}
        onClose={() => setSifModalOpen(false)}
        onReportAdded={(newRep) => {
          if (onAddReport) onAddReport(newRep);
        }}
      />

      {/* 4. Report Detail Inspection Drawer/Modal */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onUpdateStatus={(reportId, newStatus) => {
            // State update callback
          }}
        />
      )}

    </div>
  );
}
