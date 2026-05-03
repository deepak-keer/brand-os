import axiosClient from './axiosClient'

export const authApi = {
  register: (d) => axiosClient.post('/auth/register', d),
  login: (d) => axiosClient.post('/auth/login', d),
  refresh: (d) => axiosClient.post('/auth/refresh', d),
  logout: (d) => axiosClient.post('/auth/logout', d),
  forgotPassword: (d) => axiosClient.post('/auth/forgot-password', d),
  resetPassword: (token, d) => axiosClient.post(`/auth/reset-password/${token}`, d),
  getMe: () => axiosClient.get('/auth/me'),
  updateMe: (d) => axiosClient.put('/auth/me', d),
  changePassword: (d) => axiosClient.put('/auth/change-password', d),
}

export const postsApi = {
  getAll: (params) => axiosClient.get('/posts', { params }),
  create: (data) => axiosClient.post('/posts', data),
  getOne: (id) => axiosClient.get(`/posts/${id}`),
  update: (id, data) => axiosClient.put(`/posts/${id}`, data),
  delete: (id) => axiosClient.delete(`/posts/${id}`),
  updateStatus: (id, status) => axiosClient.patch(`/posts/${id}/status`, { status }),
  getCalendar: (params) => axiosClient.get('/posts/calendar', { params }),
}

export const ideasApi = {
  getAll: () => axiosClient.get('/ideas'),
  create: (data) => axiosClient.post('/ideas', data),
  update: (id, data) => axiosClient.put(`/ideas/${id}`, data),
  delete: (id) => axiosClient.delete(`/ideas/${id}`),
  move: (id, data) => axiosClient.patch(`/ideas/${id}/move`, data),
}

export const dealsApi = {
  getAll: (params) => axiosClient.get('/deals', { params }),
  create: (data) => axiosClient.post('/deals', data),
  getOne: (id) => axiosClient.get(`/deals/${id}`),
  update: (id, data) => axiosClient.put(`/deals/${id}`, data),
  delete: (id) => axiosClient.delete(`/deals/${id}`),
  getSummary: () => axiosClient.get('/deals/summary'),
}

export const analyticsApi = {
  getAll: () => axiosClient.get('/analytics'),
  create: (data) => axiosClient.post('/analytics', data),
  getStats: () => axiosClient.get('/analytics/stats'),
}

export const notificationsApi = {
  getAll: () => axiosClient.get('/notifications'),
  markRead: (id) => axiosClient.patch(`/notifications/${id}/read`),
  markAllRead: () => axiosClient.patch('/notifications/read-all'),
  delete: (id) => axiosClient.delete(`/notifications/${id}`),
}

export const aiApi = {
  generateCaption: (data) => axiosClient.post('/ai/caption', data),
  generateIdeas: (data) => axiosClient.post('/ai/ideas', data),
  generateHashtags: (data) => axiosClient.post('/ai/hashtags', data),
  generateBio: (data) => axiosClient.post('/ai/bio', data),
}

export const uploadApi = {
  avatar: (formData) => axiosClient.post('/upload/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
}
