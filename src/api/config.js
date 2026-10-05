// Same-origin `/v1`, like HeadOffice uses `/api`:
// - local: Vite proxies /v1 → VITE_API_BASE_URL
// - production: vercel.json rewrites /v1 → the backend
// The browser never calls the http:// server directly, so no HTTPS domain is needed.
export const API_BASE_URL = '/v1';

export const DEFAULT_PAGE_SIZE = 10;
