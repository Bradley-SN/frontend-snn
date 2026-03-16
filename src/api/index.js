import apiClient from './client'

export const authAPI = {
  register: (data) => apiClient.post('/users/register/', data),
  login: (credentials) => apiClient.post('/users/login/', credentials),
  logout: (refreshToken) => apiClient.post('/users/logout/', { refresh_token: refreshToken }),
  verifyEmail: (token) => apiClient.post('/users/verify-email/', { token }),
  getProfile: () => apiClient.get('/users/profile/'),
  updateProfile: (data) => apiClient.put('/users/profile/update/', data),
  changePassword: (data) => apiClient.post('/users/password/change/', data),
  requestPasswordReset: (email) => apiClient.post('/users/password/reset/', { email }),
  confirmPasswordReset: (data) => apiClient.post('/users/password/reset/confirm/', data),
  refreshToken: (refreshToken) => apiClient.post('/users/token/refresh/', { refresh: refreshToken }),
}

export const meterAPI = {
  list: (params) => apiClient.get('/meters/', { params }),
  get: (id) => apiClient.get(`/meters/${id}/`),
  create: (data) => apiClient.post('/meters/', data),
  update: (id, data) => apiClient.put(`/meters/${id}/`, data),
  delete: (id) => apiClient.delete(`/meters/${id}/`),
  getStats: (id) => apiClient.get(`/meters/${id}/stats/`),
  getEvents: (id, params) => apiClient.get(`/meters/${id}/events/`, { params }),
  controlLoad: (id, action) => apiClient.post(`/meters/${id}/load-control/`, { action }),
  search: (query) => apiClient.get('/meters/search/', { params: { q: query } }),
  getAlerts: (params) => apiClient.get('/meters/alerts/', { params }),
  acknowledgeAlert: (id) => apiClient.post(`/meters/alerts/${id}/acknowledge/`),
  resolveAlert: (id) => apiClient.post(`/meters/alerts/${id}/resolve/`),
}

export const adminOpsAPI = {
  list: (resource, params = {}) => apiClient.get(`/adminops/${resource}/`, { params }),
  create: (resource, payload) => apiClient.post(`/adminops/${resource}/`, payload),
  update: (resource, id, payload) => apiClient.patch(`/adminops/${resource}/${id}/`, payload),
  remove: (resource, id) => apiClient.delete(`/adminops/${resource}/${id}/`),
}

export const telemetryAPI = {
  list: (meterId, params) => apiClient.get(`/telemetry/${meterId}/`, { params }),
  getLatest: (meterId) => apiClient.get(`/telemetry/${meterId}/latest/`),
  getStats: (meterId, params) => apiClient.get(`/telemetry/${meterId}/stats/`, { params }),
  export: (meterId, params) => apiClient.get(`/telemetry/${meterId}/export/`, { params, responseType: 'blob' }),
  getDiagnostics: (meterId, params) => apiClient.get(`/telemetry/${meterId}/diagnostics/`, { params }),
}

export const paymentAPI = {
  list: (params) => apiClient.get('/payments/', { params }),
  get: (id) => apiClient.get(`/payments/${id}/`),
  initiate: (data) => apiClient.post('/payments/initiate/', data),
  checkStatus: (checkoutRequestId) =>
    apiClient.post('/payments/check-status/', { checkout_request_id: checkoutRequestId }),
  getStats: (params) => apiClient.get('/payments/stats/', { params }),
  getTransactions: (params) => apiClient.get('/payments/transactions/', { params }),
}

export const tokenAPI = {
  list: (params) => apiClient.get('/tokens/', { params }),
  generate: (data) => apiClient.post('/tokens/generate/', data),
  apply: (data) => apiClient.post('/tokens/apply/', data),
  verify: (data) => apiClient.post('/tokens/verify/', data),
  getHistory: (meterId, params) => apiClient.get(`/tokens/${meterId}/history/`, { params }),
}
