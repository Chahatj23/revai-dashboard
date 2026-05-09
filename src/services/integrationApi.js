import axios from "axios";
import { INTEGRATIONS_API_BASE_URL } from "../config";
import { applyDedupe } from "../lib/dedupe";

const api = axios.create({
  baseURL: INTEGRATIONS_API_BASE_URL,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

applyDedupe(api);

export const integrationApi = {
  getIntegrations: () => api.get(""),
  updateIntegration: (id, data) => api.put(`${id}`, data),
  syncIntegration: (id) => api.post(`${id}/sync`),
  getSalesforceAuthUrl: (clientId, clientSecret) => {
    const params = new URLSearchParams();
    if (clientId) params.append('clientId', clientId);
    if (clientSecret) params.append('clientSecret', clientSecret);
    return api.get(`/salesforce/auth?${params.toString()}`);
  },
};
