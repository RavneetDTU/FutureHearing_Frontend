import { http } from './client';
import { createResource, endpoint, normalizeArray } from './resource';

export const usersApi = createResource('/users', 'users');
export const rolesApi = createResource('/roles', 'roles');

/** GET /permissions -> [{ module, label, actions: [{ key, label }] }] */
export const permissionsApi = {
  catalogue: endpoint('permissions.catalogue', () => http.get('/permissions'), normalizeArray),
};

export const authApi = {
  /** POST /auth/login { username, password } -> { user, token }. Cookie fh_session is also set. */
  login: endpoint('auth.login', (credentials) => http.post('/auth/login', credentials)),
  logout: endpoint('auth.logout', () => http.post('/auth/logout')),
  /** GET /auth/me -> { id, fullName, roleName, isAdmin, permissions, defaultBranchId, defaultWarehouseId } */
  me: endpoint('auth.me', () => http.get('/auth/me')),
  /** POST /auth/forgot-password { email } -> { message, resetToken? } */
  forgotPassword: endpoint('auth.forgot', (payload) => http.post('/auth/forgot-password', payload)),
  /** POST /auth/reset-password { token, password } */
  resetPassword: endpoint('auth.reset', (payload) => http.post('/auth/reset-password', payload)),
};

export const dashboardApi = {
  /** GET /dashboard/summary?branchId -> { stats, revenueSeries, branches, stock, recent* } */
  summary: endpoint('dashboard.summary', (params) => http.get('/dashboard/summary', { params })),
};

export const notificationsApi = {
  list: endpoint('notifications.list', () => http.get('/notifications'), normalizeArray),
  markRead: endpoint('notifications.read', (id) => http.post(`/notifications/${id}/read`)),
  markAllRead: endpoint('notifications.readAll', () => http.post('/notifications/read-all')),
};

export const settingsApi = {
  get: endpoint('settings.get', (section) => http.get(`/settings/${section}`)),
  update: endpoint('settings.update', (section, payload) => http.put(`/settings/${section}`, payload)),
};
