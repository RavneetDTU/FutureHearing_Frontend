import { http } from './client';
import { USE_MOCK_API } from './config';
import { normalizeArray, normalizeItem, normalizeList } from './normalize';

const loadMock = () => import('../mocks/mockAdapter');

/**
 * Routes a call either to the development mock adapter or to the real HTTP API.
 * `mockFn` receives the mock adapter module; `realFn` performs the HTTP request.
 */
export async function call(mockFn, realFn) {
  if (USE_MOCK_API) {
    const mock = await loadMock();
    return mockFn(mock);
  }
  return realFn();
}

/**
 * Custom (non-CRUD) endpoint. `requestFn` performs the raw HTTP call; the mock handler of the
 * same name returns the same raw envelope. Both pass through `normalize`.
 */
export function endpoint(mockHandler, requestFn, normalize = normalizeItem) {
  return async (...args) =>
    normalize(await call((m) => m.handle(mockHandler, ...args), () => requestFn(...args)), args[0]);
}

export { normalizeArray, normalizeItem, normalizeList };

/**
 * Standard REST resource:
 *   GET    {path}?page&pageSize&search&sortBy&sortDir&...filters  -> { data: [], meta: { page, pageSize, total } }
 *   GET    {path}/lookup?search&...filters                        -> { data: [{ id, name }] }
 *   GET    {path}/:id                                             -> { data: {} }
 *   POST   {path}                                                 -> { data: {} }
 *   PUT    {path}/:id                                             -> { data: {} }
 *   DELETE {path}/:id                                             -> 204
 */
export function createResource(path, mockKey) {
  return {
    path,
    list: async (params = {}) =>
      normalizeList(await call((m) => m.list(mockKey, params), () => http.get(path, { params })), params),
    lookup: async (params = {}) =>
      normalizeArray(await call((m) => m.lookup(mockKey, params), () => http.get(`${path}/lookup`, { params }))),
    get: async (id) => normalizeItem(await call((m) => m.get(mockKey, id), () => http.get(`${path}/${id}`))),
    create: async (payload) =>
      normalizeItem(await call((m) => m.create(mockKey, payload), () => http.post(path, payload))),
    update: async (id, payload) =>
      normalizeItem(await call((m) => m.update(mockKey, id, payload), () => http.put(`${path}/${id}`, payload))),
    remove: (id) => call((m) => m.remove(mockKey, id), () => http.delete(`${path}/${id}`)),
  };
}
