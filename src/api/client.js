import { API_BASE_URL } from './config';

export class ApiError extends Error {
  constructor(message, { status, code, fieldErrors } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    /** Map of field name -> message, used by forms to display server validation. */
    this.fieldErrors = fieldErrors || {};
  }
}

let authToken = null;
let getAuthToken = () => authToken;
let onUnauthorized = null;

const AUTH_PUBLIC = new Set(['/auth/login', '/auth/forgot-password', '/auth/reset-password']);

/** In-memory session token only. The httpOnly `fh_session` cookie is sent via credentials: 'include'. */
export function setAuthToken(token) {
  authToken = token || null;
}

export function getStoredAuthToken() {
  return authToken;
}

export function setAuthTokenProvider(fn) {
  getAuthToken = fn;
}

export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

export function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) value.forEach((v) => search.append(key, v));
    else search.append(key, value);
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

function fieldErrorsFrom(payload) {
  if (payload?.errors && typeof payload.errors === 'object' && !Array.isArray(payload.errors)) {
    return payload.errors;
  }
  const detail = payload?.detail;
  if (!Array.isArray(detail)) return {};
  return detail.reduce((acc, item) => {
    const loc = Array.isArray(item.loc) ? item.loc.filter((p) => p !== 'body' && p !== 'query') : [];
    const key = loc.length ? String(loc[loc.length - 1]) : '_';
    acc[key] = item.msg || item.message || 'Invalid value';
    return acc;
  }, {});
}

function errorMessage(payload, status) {
  if (payload?.message) return payload.message;
  const detail = payload?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  return `Request failed (${status})`;
}

function captureToken(payload) {
  const token = payload?.data?.token ?? payload?.token;
  if (token) setAuthToken(token);
}

/** Backend stores empty strings as null. Keep writes aligned so PUT clears a field instead of sending "". */
function emptyStringsToNull(value) {
  if (value === '') return null;
  if (Array.isArray(value)) return value.map(emptyStringsToNull);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, emptyStringsToNull(item)]));
  }
  return value;
}

async function parseJson(response) {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function request(path, { method = 'GET', params, body, headers = {}, signal, raw } = {}) {
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const token = getAuthToken();

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}${buildQuery(params)}`, {
      method,
      signal,
      credentials: 'include',
      headers: {
        Accept: raw ? raw : 'application/json',
        ...(body !== undefined && !isFormData ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(emptyStringsToNull(body)),
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('Unable to reach the server. Check your connection and try again.', { status: 0 });
  }

  if (raw) {
    if (!response.ok) {
      const payload = await parseJson(response);
      throw new ApiError(errorMessage(payload, response.status), {
        status: response.status,
        code: payload?.code,
        fieldErrors: fieldErrorsFrom(payload),
      });
    }
    return response;
  }

  const payload = await parseJson(response);
  if (!response.ok) {
    if (response.status === 401 && !AUTH_PUBLIC.has(path) && path !== '/auth/me') {
      setAuthToken(null);
      onUnauthorized?.();
    }
    throw new ApiError(errorMessage(payload, response.status), {
      status: response.status,
      code: payload?.code,
      fieldErrors: fieldErrorsFrom(payload),
    });
  }
  captureToken(payload);
  return payload;
}

export async function downloadFile(path, { params, filename } = {}) {
  const response = await request(path, { params, raw: '*/*' });
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || 'download';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function openFile(path, { params } = {}) {
  const response = await request(path, { params, raw: '*/*' });
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener');
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export const http = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};
