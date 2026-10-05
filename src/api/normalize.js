/**
 * Response normalisers. If the backend response envelope differs from the assumed
 * `{ data, meta: { page, pageSize, total } }`, adapt it here — nowhere else.
 */
export function normalizeList(response, params = {}) {
  if (Array.isArray(response)) {
    return { items: response, total: response.length, page: 1, pageSize: response.length };
  }
  const items = response?.data ?? response?.items ?? response?.results ?? [];
  const meta = response?.meta ?? response ?? {};
  return {
    items,
    total: meta.total ?? meta.count ?? items.length,
    page: Number(meta.page ?? params.page ?? 1),
    pageSize: Number(meta.pageSize ?? params.pageSize ?? items.length),
  };
}

export function normalizeItem(response) {
  if (response && typeof response === 'object' && 'data' in response && !Array.isArray(response.data)) {
    return response.data;
  }
  return response;
}

export function normalizeArray(response) {
  return normalizeList(response).items;
}
