import { http } from './client';
import { createResource, endpoint, normalizeArray } from './resource';

export const usersApi = createResource('/users');
export const rolesApi = createResource('/roles');

/** GET /permissions -> [{ module, label, actions: [{ key, label }] }] */
export const permissionsApi = {
  catalogue: endpoint(() => http.get('/permissions'), normalizeArray),
};

export const authApi = {
  /** POST /auth/login { username, password } -> { user, token }. Cookie fh_session is also set. */
  login: endpoint((credentials) => http.post('/auth/login', credentials)),
  logout: endpoint(() => http.post('/auth/logout')),
  /** GET /auth/me -> { id, fullName, roleName, isAdmin, permissions, defaultBranchId, defaultWarehouseId } */
  me: endpoint(() => http.get('/auth/me')),
  /** POST /auth/forgot-password { email } -> { message, resetToken? } */
  forgotPassword: endpoint((payload) => http.post('/auth/forgot-password', payload)),
  /** POST /auth/reset-password { token, password } */
  resetPassword: endpoint((payload) => http.post('/auth/reset-password', payload)),
};

export const dashboardApi = {
  /** GET /dashboard/summary?branchId -> { stats, revenueSeries, branches, stock, recent* } */
  summary: endpoint((params) => http.get('/dashboard/summary', { params })),
};

export const notificationsApi = {
  list: endpoint(() => http.get('/notifications'), normalizeArray),
  markRead: endpoint((id) => http.post(`/notifications/${id}/read`)),
  markAllRead: endpoint(() => http.post('/notifications/read-all')),
};

export const settingsApi = {
  get: endpoint((section) => http.get(`/settings/${section}`)),
  update: endpoint((section, payload) => http.put(`/settings/${section}`, payload)),
};
