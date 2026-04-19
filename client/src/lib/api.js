// API client for LifeNet — wired to our Express backend
// Uses VITE_API_URL in production (e.g. https://lifenet-api.onrender.com)
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const getAuthToken = () => localStorage.getItem('accessToken');

const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'API request failed' }));
    throw new Error(error.message || 'API request failed');
  }

  const json = await response.json();
  return json.data !== undefined ? json.data : json;
};

export const api = {
  auth: {
    login: (credentials) =>
      apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    me: () => apiRequest('/auth/me'),
    register: (data) =>
      apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  organs: {
    list: (params = '') => apiRequest(`/organs${params ? '?' + params : ''}`),
    create: (data) =>
      apiRequest('/organs', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      apiRequest(`/organs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    match: (data) =>
      apiRequest('/organs/match', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  blood: {
    list: (params = '') => apiRequest(`/blood${params ? '?' + params : ''}`),
    summary: () => apiRequest('/blood/summary'),
    create: (data) =>
      apiRequest('/blood', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      apiRequest(`/blood/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },
  requests: {
    list: (params = '') => apiRequest(`/requests${params ? '?' + params : ''}`),
    create: (data) =>
      apiRequest('/requests', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    approve: (id) =>
      apiRequest(`/requests/${id}/approve`, { method: 'PUT' }),
    transfer: (id) =>
      apiRequest(`/requests/${id}/transfer`, { method: 'PUT' }),
    complete: (id) =>
      apiRequest(`/requests/${id}/complete`, { method: 'PUT' }),
    reject: (id) =>
      apiRequest(`/requests/${id}/reject`, { method: 'PUT' }),
  },
  dashboard: {
    stats: () => apiRequest('/dashboard/stats'),
    analytics: () => apiRequest('/dashboard/analytics'),
    activity: () => apiRequest('/dashboard/activity'),
    notifications: () => apiRequest('/dashboard/notifications'),
  },
};
