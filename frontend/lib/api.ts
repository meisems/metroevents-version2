import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001' });

api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      Cookies.remove('token');
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authApi = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: object) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

// Users
export const usersApi = {
  list: () => api.get('/users'),
  update: (id: string, data: object) => api.patch(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

// Clients
export const clientsApi = {
  list: (p?: object) => api.get('/clients', { params: p }),
  get: (id: string) => api.get(`/clients/${id}`),
  create: (data: object) => api.post('/clients', data),
  update: (id: string, data: object) => api.patch(`/clients/${id}`, data),
  advance: (id: string) => api.post(`/clients/${id}/advance`),
  delete: (id: string) => api.delete(`/clients/${id}`),
};

// Events
export const eventsApi = {
  list: (p?: object) => api.get('/events', { params: p }),
  get: (id: string) => api.get(`/events/${id}`),
  create: (data: object) => api.post('/events', data),
  update: (id: string, data: object) => api.patch(`/events/${id}`, data),
  delete: (id: string) => api.delete(`/events/${id}`),
};

// Quotes
export const quotesApi = {
  getByEvent: (eventId: string) => api.get(`/quotes/event/${eventId}`),
  create: (data: object) => api.post('/quotes', data),
  update: (id: string, data: object) => api.patch(`/quotes/${id}`, data),
  approve: (id: string) => api.post(`/quotes/${id}/approve`),
  addItem: (id: string, data: object) => api.post(`/quotes/${id}/items`, data),
  removeItem: (id: string, itemId: string) => api.delete(`/quotes/${id}/items/${itemId}`),
};

// Payments
export const paymentsApi = {
  getByEvent: (eventId: string) => api.get(`/payments/event/${eventId}`),
  create: (data: object) => api.post('/payments', data),
  update: (id: string, data: object) => api.patch(`/payments/${id}`, data),
  delete: (id: string) => api.delete(`/payments/${id}`),
};

// Inventory
export const inventoryApi = {
  list: (p?: object) => api.get('/inventory', { params: p }),
  get: (id: string) => api.get(`/inventory/${id}`),
  create: (data: object) => api.post('/inventory', data),
  update: (id: string, data: object) => api.patch(`/inventory/${id}`, data),
  reserve: (data: object) => api.post('/inventory/reserve', data),
  getReservations: (eventId: string) => api.get(`/inventory/reservations/${eventId}`),
};

// Suppliers
export const suppliersApi = {
  list: (p?: object) => api.get('/suppliers', { params: p }),
  get: (id: string) => api.get(`/suppliers/${id}`),
  create: (data: object) => api.post('/suppliers', data),
  update: (id: string, data: object) => api.patch(`/suppliers/${id}`, data),
  delete: (id: string) => api.delete(`/suppliers/${id}`),
};

// Meetings
export const meetingsApi = {
  list: (p?: object) => api.get('/meetings', { params: p }),
  create: (data: object) => api.post('/meetings', data),
  update: (id: string, data: object) => api.patch(`/meetings/${id}`, data),
  delete: (id: string) => api.delete(`/meetings/${id}`),
};

// Checklist
export const checklistApi = {
  getByEvent: (eventId: string) => api.get(`/checklist/event/${eventId}`),
  create: (data: object) => api.post('/checklist', data),
  toggle: (id: string) => api.patch(`/checklist/${id}/toggle`),
  loadTemplate: (eventId: string, type: string) => api.post(`/checklist/template/${eventId}`, { type }),
  delete: (id: string) => api.delete(`/checklist/${id}`),
};

// Tasks
export const tasksApi = {
  getByEvent: (eventId: string) => api.get(`/tasks/event/${eventId}`),
  create: (data: object) => api.post('/tasks', data),
  toggle: (id: string) => api.patch(`/tasks/${id}/toggle`),
  delete: (id: string) => api.delete(`/tasks/${id}`),
};

// Moodboard
export const moodboardApi = {
  getByEvent: (eventId: string) => api.get(`/moodboard/event/${eventId}`),
  create: (data: object) => api.post('/moodboard', data),
  approve: (id: string) => api.patch(`/moodboard/${id}/approve`),
  delete: (id: string) => api.delete(`/moodboard/${id}`),
};

// Event Log
export const eventLogApi = {
  getByEvent: (eventId: string) => api.get(`/event-log/event/${eventId}`),
  create: (data: object) => api.post('/event-log', data),
  delete: (id: string) => api.delete(`/event-log/${id}`),
};

// Reminders
export const remindersApi = {
  get: () => api.get('/reminders'),
};

// Reports
export const reportsApi = {
  get: (p?: object) => api.get('/reports', { params: p }),
};

// Portal
export const portalApi = {
  getMyEvent: () => api.get('/portal/event'),
  getQuote: () => api.get('/portal/quote'),
  approveQuote: (id: string) => api.post(`/portal/quote/${id}/approve`),
  getPayments: () => api.get('/portal/payments'),
  getMoodboard: () => api.get('/portal/moodboard'),
  submitPeg: (data: object) => api.post('/portal/moodboard', data),
  submitFeedback: (data: object) => api.post('/portal/feedback', data),
};

// Public
export const publicApi = {
  getTestimonials: () => api.get('/public/reviews'),
  submitOrderRequest: (data: object) => api.post('/public/order-request', data),
  submitReview: (data: object) => api.post('/public/review', data),
};

export default api;
