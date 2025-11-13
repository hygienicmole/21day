import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  register: (username: string, password: string) =>
    api.post('/auth/register', { username, password }),
  me: () => api.get('/auth/me'),
};

// Campaigns API
export const campaignsAPI = {
  getAll: () => api.get('/campaigns'),
  getById: (id: number) => api.get(`/campaigns/${id}`),
  create: (data: any) => api.post('/campaigns', data),
  update: (id: number, data: any) => api.put(`/campaigns/${id}`, data),
  delete: (id: number) => api.delete(`/campaigns/${id}`),
  getAnalytics: (id: number) => api.get(`/campaigns/${id}/analytics`),
};

// Contacts API
export const contactsAPI = {
  getAll: () => api.get('/contacts'),
  getByCampaign: (campaignId: number) => api.get(`/contacts/campaign/${campaignId}`),
  getById: (id: number) => api.get(`/contacts/${id}`),
  create: (data: any) => api.post('/contacts', data),
  update: (id: number, data: any) => api.put(`/contacts/${id}`, data),
  delete: (id: number) => api.delete(`/contacts/${id}`),
  import: (campaignId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/contacts/import/${campaignId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Sequences API
export const sequencesAPI = {
  getByCampaign: (campaignId: number) => api.get(`/sequences/campaign/${campaignId}`),
  create: (data: any) => api.post('/sequences', data),
  bulkCreate: (campaignId: number, steps: any[]) =>
    api.post(`/sequences/bulk/${campaignId}`, { steps }),
  update: (id: number, data: any) => api.put(`/sequences/${id}`, data),
  delete: (id: number) => api.delete(`/sequences/${id}`),
};

// Templates API
export const templatesAPI = {
  getAll: (channel?: string, category?: string) => {
    const params = new URLSearchParams();
    if (channel) params.append('channel', channel);
    if (category) params.append('category', category);
    return api.get(`/templates?${params.toString()}`);
  },
  getById: (id: number) => api.get(`/templates/${id}`),
  create: (data: any) => api.post('/templates', data),
  update: (id: number, data: any) => api.put(`/templates/${id}`, data),
  delete: (id: number) => api.delete(`/templates/${id}`),
};

// Touchpoints API
export const touchpointsAPI = {
  getByCampaign: (campaignId: number) => api.get(`/touchpoints/campaign/${campaignId}`),
  getByContact: (contactId: number) => api.get(`/touchpoints/contact/${contactId}`),
  create: (data: any) => api.post('/touchpoints', data),
  update: (id: number, data: any) => api.put(`/touchpoints/${id}`, data),
  execute: (campaignId: number, day?: number) =>
    api.post(`/touchpoints/execute/${campaignId}`, { day }),
  getActivity: (campaignId: number, limit?: number) => {
    const params = limit ? `?limit=${limit}` : '';
    return api.get(`/touchpoints/activity/${campaignId}${params}`);
  },
};

export default api;
