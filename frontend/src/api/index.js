import axios from "axios";
import { auth } from "../firebase";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: { "Content-Type": "application/json" },
});

// Attach logged-in user info to every request for audit logging
api.interceptors.request.use((config) => {
  const user = auth.currentUser;
  if (user) {
    config.headers["X-User-Name"] = user.displayName || user.email;
    config.headers["X-User-Email"] = user.email;
  }
  return config;
});

export const getDashboardStats = () => api.get("/dashboard/stats");

export const getProducts = (params) => api.get("/products", { params });
export const getProduct = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post("/products", data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const updateStock = (id, data) => api.patch(`/products/${id}/stock`, data);

export const getCategories = () => api.get("/categories");
export const createCategory = (data) => api.post("/categories", data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

export const getMovements = (params) => api.get("/movements", { params });
export const getAuditLogs = (params) => api.get("/audit", { params });

export default api;
