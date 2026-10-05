import { http } from './client';
import { normalizeArray, normalizeItem, normalizeList } from './normalize';

/**
 * Custom (non-CRUD) endpoint. `requestFn` performs the raw HTTP call; the response passes
 * through `normalize`.
 */
export function endpoint(requestFn, normalize = normalizeItem) {
  return async (...args) => normalize(await requestFn(...args), args[0]);
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
export function createResource(path) {
  return {
    path,
    list: async (params = {}) => normalizeList(await http.get(path, { params }), params),
    lookup: async (params = {}) => normalizeArray(await http.get(`${path}/lookup`, { params })),
    get: async (id) => normalizeItem(await http.get(`${path}/${id}`)),
    create: async (payload) => normalizeItem(await http.post(path, payload)),
    update: async (id, payload) => normalizeItem(await http.put(`${path}/${id}`, payload)),
    remove: (id) => http.delete(`${path}/${id}`),
  };
}
