import React, { useState } from 'react';
import OrganizationLayout from './OrganizationLayout';
import OverviewPage from './pages/OverviewPage';
import SafetyReportsPage from './pages/SafetyReportsPage';
import SifIntelligencePage from './pages/SifIntelligencePage';
import CriticalControlsPage from './pages/CriticalControlsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import { MOCK_REPORTS } from './data/mockData';

export default function OrganizationPortal({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [selectedReport, setSelectedReport] = useState(null);
  const [sifModalOpen, setSifModalOpen] = useState(false);

  const handleAddReport = (newReport) => {
    setReports(prev => [newReport, ...prev]);
    setSelectedReport(newReport);
  };

  return (
    <OrganizationLayout
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      onLogout={onLogout}
      user={user}
      onAddReport={handleAddReport}
      selectedReport={selectedReport}
      setSelectedReport={setSelectedReport}
      sifModalOpen={sifModalOpen}
      setSifModalOpen={setSifModalOpen}
    >
      {activeTab === 'overview' && (
        <OverviewPage
          onSelectReport={setSelectedReport}
          onNavigate={setActiveTab}
        />
      )}

      {activeTab === 'safety_reports' && (
        <SafetyReportsPage
          reports={reports}
          onSelectReport={setSelectedReport}
        />
      )}

      {activeTab === 'sif_intelligence' && (
        <SifIntelligencePage
          onSelectReport={setSelectedReport}
          onOpenLogSif={() => setSifModalOpen(true)}
        />
      )}

      {activeTab === 'critical_controls' && (
        <CriticalControlsPage />
      )}

      {activeTab === 'analytics' && (
        <AnalyticsPage />
      )}

      {activeTab === 'settings' && (
        <SettingsPage />
      )}
    </OrganizationLayout>
  );
}
