// =============================================
// API Client — centralized fetch wrapper
// =============================================

const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
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
