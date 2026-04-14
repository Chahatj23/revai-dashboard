import axios from 'axios';
import { INVENTORY_API_BASE_URL } from '../config';
import { applyDedupe } from '../lib/dedupe';

const API_BASE_URL = INVENTORY_API_BASE_URL;

// Create an instance with interceptors for auth
const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

applyDedupe(api);

export const inventoryApi = {
  // Products
  getProducts: () => api.get(`/products`),
  getProduct: (id) => api.get(`/products/${id}`),
  addProduct: (productData) => api.post(`/products`, productData),
  updateProduct: (id, productData) => api.put(`/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  bulkDeleteProducts: (ids) => api.post(`/products/bulk-delete`, { ids }),
  importProducts: (products) => api.post(`/products/import`, { products }),

  // Sale Orders
  getSaleOrders: () => api.get(`/orders/sales`),
  addSaleOrder: (orderData) => api.post(`/orders/sales`, orderData),
  updateSaleOrder: (id, orderData) => api.put(`/orders/sales/${id}`, orderData),
  bulkDeleteSaleOrders: (ids) => api.post(`/orders/sales/bulk-delete`, { ids }),

  // Purchase Orders
  getPurchaseOrders: () => api.get(`/orders/purchase`),
  addPurchaseOrder: (orderData) => api.post(`/orders/purchase`, orderData),
  updatePurchaseOrder: (id, orderData) => api.put(`/orders/purchase/${id}`, orderData),
  bulkDeletePurchaseOrders: (ids) => api.post(`/orders/purchase/bulk-delete`, { ids }),

  // Promotions
  getPromotions: () => api.get(`/promotions`),
  addPromotion: (promoData) => api.post(`/promotions`, promoData),

  // AI
  getRecommendations: (data) => api.post(`/recommendations`, data),
};
