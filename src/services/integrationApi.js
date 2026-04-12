import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/integrations";

// Set withCredentials if using cookies, otherwise use headers
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const integrationApi = {
  getIntegrations: () => axios.get(API_BASE_URL),
  updateIntegration: (id, data) => axios.put(`${API_BASE_URL}/${id}`, data),
  syncIntegration: (id) => axios.post(`${API_BASE_URL}/${id}/sync`),
};
