import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const client = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const analyzeReport = (payload) =>
  client.post("/api/reports/analyze", payload).then((res) => res.data);

export const getReports = (params = {}) =>
  client.get("/api/reports", { params }).then((res) => res.data);

export const getReport = (id) =>
  client.get(`/api/reports/${id}`).then((res) => res.data);

export const uploadReportsCsv = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return client
    .post("/api/reports/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
};

export const getDashboard = () =>
  client.get("/api/dashboard").then((res) => res.data);

export const getDashboardAnalytics = () =>
  client.get("/api/dashboard").then((res) => res.data).catch(() =>
    client.get("/api/analytics/dashboard").then((res) => res.data)
  );

export const submitReview = (reportId, payload) =>
  client.post(`/api/reports/${reportId}/review`, payload).then((res) => res.data);

export default client;

