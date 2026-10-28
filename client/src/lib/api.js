// A single API client keeps cookie refresh and error handling consistent
// across sign-in and every dashboard workflow.
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/$/, '');
const API_BASE = configuredApiUrl
  ? `${configuredApiUrl.endsWith('/api') ? configuredApiUrl : `${configuredApiUrl}/api`}`
  : '/api';

const clearSession = () => {
  localStorage.removeItem('accessToken');
  window.dispatchEvent(new Event('lifenet:unauthorized'));
};

const apiRequest = async (endpoint, options = {}, canRefresh = true) => {
  const token = localStorage.getItem('accessToken');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  const publicAuthEndpoints = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout', '/auth/password/reset-request', '/auth/password/reset', '/auth/email/verify', '/auth/email/resend-verification'];
  if (response.status === 401 && canRefresh && !publicAuthEndpoints.includes(endpoint)) {
    try {
      const refreshResponse = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (refreshResponse.ok) {
        const refreshResult = await refreshResponse.json();
        const newToken = refreshResult.data?.accessToken;
        if (newToken) {
          localStorage.setItem('accessToken', newToken);
          window.dispatchEvent(new CustomEvent('lifenet:token-refreshed', { detail: newToken }));
          return apiRequest(endpoint, {
            ...options,
            headers: { ...options.headers, Authorization: `Bearer ${newToken}` },
          }, false);
        }
      }
    } catch {
      // The original response below carries the useful API error.
    }
    clearSession();
  }
  if (response.status === 401 && !canRefresh && !publicAuthEndpoints.includes(endpoint)) clearSession();

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result.message || 'The request could not be completed.');
    error.status = response.status;
    error.details = result.errors || [];
    throw error;
  }

  return result.data !== undefined ? result.data : result;
};

const jsonBody = (method, data) => ({
  method,
  ...(data === undefined ? {} : { body: JSON.stringify(data) }),
});

export const api = {
  auth: {
    login: (credentials) => apiRequest('/auth/login', jsonBody('POST', credentials)),
    me: () => apiRequest('/auth/me'),
    refresh: () => apiRequest('/auth/refresh', jsonBody('POST'), false),
    logout: () => apiRequest('/auth/logout', jsonBody('POST'), false),
    register: (data) => apiRequest('/auth/register', jsonBody('POST', data)),
    changePassword: (data) => apiRequest('/auth/password', jsonBody('POST', data)),
    updateProfile: (data) => apiRequest('/auth/profile', jsonBody('PUT', data)),
    requestPasswordReset: (email) => apiRequest('/auth/password/reset-request', jsonBody('POST', { email })),
    resetPassword: (data) => apiRequest('/auth/password/reset', jsonBody('POST', data)),
    verifyEmail: (token) => apiRequest('/auth/email/verify', jsonBody('POST', { token })),
    resendEmailVerification: (email) => apiRequest('/auth/email/resend-verification', jsonBody('POST', { email })),
  },
  centers: {
    list: (search = '') => apiRequest(`/centers${search ? `?search=${encodeURIComponent(search)}` : ''}`),
    setVerification: (id, status) => apiRequest(`/centers/${id}/verification`, jsonBody('PATCH', { status })),
  },
  doctors: {
    list: (params = '') => apiRequest(`/doctors${params ? `?${params}` : ''}`),
    myProfile: () => apiRequest('/doctors/profile/me'),
    saveProfile: (data) => apiRequest('/doctors/profile', jsonBody('PUT', data)),
    slots: (doctorId) => apiRequest(`/doctors/${doctorId}/slots`),
    mySlots: () => apiRequest('/doctors/slots/me'),
    createSlot: (data) => apiRequest('/doctors/slots', jsonBody('POST', data)),
    closeSlot: (id) => apiRequest(`/doctors/slots/${id}`, { method: 'DELETE' }),
  },
  appointments: {
    list: () => apiRequest('/appointments'),
    book: (data) => apiRequest('/appointments', jsonBody('POST', data)),
    update: (id, action) => apiRequest(`/appointments/${id}`, jsonBody('PATCH', { action })),
  },
  pharmacies: {
    listings: (params = '') => apiRequest(`/pharmacies/listings${params ? `?${params}` : ''}`),
    myListings: () => apiRequest('/pharmacies/listings/mine'),
    createListing: (data) => apiRequest('/pharmacies/listings', jsonBody('POST', data)),
    updateListing: (id, data) => apiRequest(`/pharmacies/listings/${id}`, jsonBody('PUT', data)),
    orders: () => apiRequest('/pharmacies/orders'),
    placeOrder: (data) => apiRequest('/pharmacies/orders', jsonBody('POST', data)),
    updateOrder: (id, action) => apiRequest(`/pharmacies/orders/${id}`, jsonBody('PATCH', { action })),
  },
  suppliers: {
    listings: (params = '') => apiRequest(`/suppliers/listings${params ? `?${params}` : ''}`),
    myListings: () => apiRequest('/suppliers/listings/mine'),
    createListing: (data) => apiRequest('/suppliers/listings', jsonBody('POST', data)),
    updateListing: (id, data) => apiRequest(`/suppliers/listings/${id}`, jsonBody('PUT', data)),
    orders: () => apiRequest('/suppliers/orders'),
    placeOrder: (data) => apiRequest('/suppliers/orders', jsonBody('POST', data)),
    updateOrder: (id, action) => apiRequest(`/suppliers/orders/${id}`, jsonBody('PATCH', { action })),
  },
  organs: {
    list: (params = '') => apiRequest(`/organs${params ? `?${params}` : ''}`),
    create: (data) => apiRequest('/organs', jsonBody('POST', data)),
    update: (id, data) => apiRequest(`/organs/${id}`, jsonBody('PUT', data)),
    match: (data) => apiRequest('/organs/match', jsonBody('POST', data)),
  },
  blood: {
    list: (params = '') => apiRequest(`/blood${params ? `?${params}` : ''}`),
    summary: () => apiRequest('/blood/summary'),
    create: (data) => apiRequest('/blood', jsonBody('POST', data)),
    update: (id, data) => apiRequest(`/blood/${id}`, jsonBody('PUT', data)),
  },
  requests: {
    list: (params = '') => apiRequest(`/requests${params ? `?${params}` : ''}`),
    create: (data) => apiRequest('/requests', jsonBody('POST', data)),
    match: (id) => apiRequest(`/requests/${id}/match`, jsonBody('POST')),
    assign: (id, resourceId) => apiRequest(`/requests/${id}/assign`, jsonBody('POST', { resourceId })),
    approve: (id) => apiRequest(`/requests/${id}/approve`, jsonBody('PUT')),
    transfer: (id) => apiRequest(`/requests/${id}/transfer`, jsonBody('PUT')),
    complete: (id) => apiRequest(`/requests/${id}/complete`, jsonBody('PUT')),
    reject: (id, reason) => apiRequest(`/requests/${id}/reject`, jsonBody('PUT', { reason })),
    cancel: (id) => apiRequest(`/requests/${id}/cancel`, jsonBody('PUT')),
  },
  dashboard: {
    stats: () => apiRequest('/dashboard/stats'),
    analytics: () => apiRequest('/dashboard/analytics'),
    activity: () => apiRequest('/dashboard/activity'),
    notifications: (params = '') => apiRequest(`/dashboard/notifications${params ? `?${params}` : ''}`),
    markNotificationsRead: (ids = []) => apiRequest('/dashboard/notifications/read', jsonBody('PUT', { ids })),
  },
};
