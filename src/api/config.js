const env = import.meta.env;

export const API_BASE_URL = (env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export const USE_MOCK_API =
  env.VITE_USE_MOCK_API !== undefined && env.VITE_USE_MOCK_API !== ''
    ? env.VITE_USE_MOCK_API === 'true'
    : !API_BASE_URL;

export const DEFAULT_PAGE_SIZE = 10;
