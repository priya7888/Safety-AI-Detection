import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AnalyzeReport from "./pages/AnalyzeReport";
import BulkUpload from "./pages/BulkUpload";
import ReportHistory from "./pages/ReportHistory";
import ReportDetails from "./pages/ReportDetails";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analyze" element={<AnalyzeReport />} />
        <Route path="/upload" element={<BulkUpload />} />
        <Route path="/reports" element={<ReportHistory />} />
        <Route path="/reports/:id" element={<ReportDetails />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

