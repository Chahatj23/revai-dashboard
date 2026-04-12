import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getLeads = () => API.get("/leads");
export const getTasks = (status) => API.get("/tasks", { params: { status } });
export const updateLeadPriority = (id, priority) => API.put(`/leads/${id}/priority`, { priority });
export const getAnomalies = () => API.get("/leads/anomalies");
export const submitFeedback = (id, feedback) => API.put(`/leads/${id}/feedback`, { feedback });

// Phase 4 CRUD hooks
export const createLead = (payload) => API.post("/leads/score", payload);
export const updateLead = (id, payload) => API.put(`/leads/${id}`, payload);
export const deleteLead = (id) => API.delete(`/leads/${id}`);

// CRM Suite Additions
export const getDeals = () => API.get("/deals");
export const seedDemoData = () => API.post("/crm/seed");

// Task CRUD hooks
export const createTask = (subject, priority) => API.post("/tasks", { subject, priority });
export const updateTask = (id, payload) => API.put(`/tasks/${id}`, payload);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);
