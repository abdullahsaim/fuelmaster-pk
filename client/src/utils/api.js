import axios from 'axios';

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';

const api = axios.create({ baseURL: API_BASE, headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fuelmaster_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('fuelmaster_token');
      localStorage.removeItem('fuelmaster_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const dashboardAPI = {
  get: () => api.get('/dashboard'),
  getPnL: (params) => api.get('/dashboard/pnl', { params }),
};

export const salesAPI = {
  getAll: (params) => api.get('/sales', { params }),
  getSummary: (params) => api.get('/sales/summary', { params }),
  create: (data) => api.post('/sales', data),
  delete: (id) => api.delete(`/sales/${id}`),
};

const makeCrud = (endpoint) => ({
  getAll: (params) => api.get(`/${endpoint}`, { params }),
  getOne: (id) => api.get(`/${endpoint}/${id}`),
  create: (data) => api.post(`/${endpoint}`, data),
  update: (id, data) => api.put(`/${endpoint}/${id}`, data),
  delete: (id) => api.delete(`/${endpoint}/${id}`),
});

export const purchasesAPI = makeCrud('purchases');
export const suppliersAPI = makeCrud('suppliers');
export const customersAPI = makeCrud('customers');
export const employeesAPI = makeCrud('employees');
export const expensesAPI = makeCrud('expenses');
export const fuelTypesAPI = makeCrud('fuel-types');
export const tanksAPI = makeCrud('tanks');
export const nozzlesAPI = makeCrud('nozzles');
export const productsAPI = makeCrud('products');
export const settingsAPI = makeCrud('settings');
export const payrollAPI = {
  getAll: (params) => api.get('/payroll', { params }),
  generate: (data) => api.post('/payroll', data),
  update: (id, data) => api.put(`/payroll/${id}`, data),
  process: (data) => api.post('/payroll/process', data),
  delete: (id) => api.delete(`/payroll/${id}`),
};

export default api;
