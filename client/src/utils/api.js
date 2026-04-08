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

export const purchasesAPI2 = {
  getAll: (params) => api.get('/purchases', { params }),
  create: (data) => api.post('/purchases', data),
  update: (id, data) => api.put(`/purchases/${id}`, data),
  delete: (id) => api.delete(`/purchases/${id}`),
};

export const readingsAPI = {
  getAll: (params) => api.get('/readings', { params }),
  create: (data) => api.post('/readings', data),
  delete: (id) => api.delete(`/readings/${id}`),
};
export const dipsAPI = {
  getAll: (params) => api.get('/dips', { params }),
  create: (data) => api.post('/dips', data),
  delete: (id) => api.delete(`/dips/${id}`),
};
export const creditPaymentsAPI = {
  getAll: (params) => api.get('/credit-payments', { params }),
  create: (data) => api.post('/credit-payments', data),
  delete: (id) => api.delete(`/credit-payments/${id}`),
  ledger: (customerId) => api.get(`/customers/${customerId}/ledger`),
};
export const supplierPaymentsAPI = {
  getAll: (params) => api.get('/supplier-payments', { params }),
  create: (data) => api.post('/supplier-payments', data),
  delete: (id) => api.delete(`/supplier-payments/${id}`),
};
export const pumpsAPI = {
  getAll: (params) => api.get('/pumps', { params }),
  create: (data) => api.post('/pumps', data),
  update: (id, data) => api.put(`/pumps/${id}`, data),
  delete: (id) => api.delete(`/pumps/${id}`),
};
export const historyAPI = {
  feed: (params) => api.get('/history', { params }),
  stockMovements: (params) => api.get('/stock-movements', { params }),
};

export const reportsAPI = {
  sales:       (params) => api.get('/reports/sales',         { params }),
  purchases:   (params) => api.get('/reports/purchases',     { params }),
  daySummary:  (params) => api.get('/reports/day-summary',   { params }),
  shift:       (params) => api.get('/reports/shift',         { params }),
  stock:       (params) => api.get('/reports/stock',         { params }),
  creditAging: (params) => api.get('/reports/credit-aging',  { params }),
  expenses:    (params) => api.get('/reports/expenses',      { params }),
  fuelProfit:  (params) => api.get('/reports/fuel-profit',   { params }),
  variance:    (params) => api.get('/reports/variance',      { params }),
  monthlyTrend:(params) => api.get('/reports/monthly-trend', { params }),
  customer:    (id, params) => api.get(`/reports/customer/${id}`, { params }),
  supplier:    (id, params) => api.get(`/reports/supplier/${id}`, { params }),
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
