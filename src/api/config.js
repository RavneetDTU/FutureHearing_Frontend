const env = import.meta.env;

function resolveApiBase(raw) {
  const configured = (raw || '').replace(/\/$/, '');
  if (typeof window === 'undefined' || window.location.protocol !== 'https:') return configured;
  if (!configured.startsWith('http://')) return configured;
  try {
    return new URL(configured).pathname.replace(/\/$/, '') || '/v1';
  } catch {
    return '/v1';
  }
}

export const API_BASE_URL = resolveApiBase(env.VITE_API_BASE_URL);

export const USE_MOCK_API =
  env.VITE_USE_MOCK_API !== undefined && env.VITE_USE_MOCK_API !== ''
    ? env.VITE_USE_MOCK_API === 'true'
    : !API_BASE_URL;

export const DEFAULT_PAGE_SIZE = 10;
