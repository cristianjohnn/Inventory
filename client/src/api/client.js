// =============================================
// API Client — centralized fetch wrapper
// =============================================

const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('auth_token');
  const url = `${BASE_URL}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    // Auto-redirect to login on 401
    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    const error = new Error(data.error?.message || 'Something went wrong');
    error.code = data.error?.code;
    error.details = data.error?.details;
    error.status = response.status;
    throw error;
  }

  return data;
}

// =============================================
// Asset API
// =============================================

export const assetsApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
    ).toString();
    return request(`/assets${query ? `?${query}` : ''}`);
  },

  get: (id) => request(`/assets/${id}`),

  create: (data) =>
    request('/assets', { method: 'POST', body: data }),

  update: (id, data) =>
    request(`/assets/${id}`, { method: 'PUT', body: data }),

  delete: (id) =>
    request(`/assets/${id}`, { method: 'DELETE' }),

  assign: (id, employeeName) =>
    request(`/assets/${id}/assign`, {
      method: 'POST',
      body: { employeeName },
    }),

  unassign: (id) =>
    request(`/assets/${id}/unassign`, { method: 'POST' }),

  history: (id) => request(`/assets/${id}/history`),
};

// =============================================
// Dashboard API
// =============================================

export const dashboardApi = {
  get: () => request('/dashboard'),
};

// =============================================
// Notifications API
// =============================================

export const notificationsApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
    ).toString();
    return request(`/notifications${query ? `?${query}` : ''}`);
  },

  unreadCount: () => request('/notifications/unread-count'),

  markRead: (id) =>
    request(`/notifications/${id}/read`, { method: 'PATCH' }),

  markAllRead: () =>
    request('/notifications/read-all', { method: 'PATCH' }),
};

// =============================================
// Activity Logs API
// =============================================

export const activityLogsApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
    ).toString();
    return request(`/activity-logs${query ? `?${query}` : ''}`);
  },

  stats: () => request('/activity-logs/stats'),
};

// =============================================
// User API
// =============================================

export const usersApi = {
  getProfile: () => request('/users/me'),
  updateProfile: (data) => request('/users/me', { method: 'PUT', body: data }),
  changePassword: (data) => request('/users/me/password', { method: 'PUT', body: data }),
  updatePreferences: (preferences) => request('/users/me/preferences', { method: 'PUT', body: { preferences } }),
};

// =============================================
// Search API
// =============================================

export const searchApi = {
  query: (q) => request(`/search?q=${encodeURIComponent(q)}`),
};
