import { http } from './client';
import { createResource, endpoint, normalizeList } from './resource';

export const warehousesApi = createResource('/warehouses');
export const branchesApi = createResource('/branches');
export const practicesApi = createResource('/practices');
export const suppliersApi = createResource('/suppliers');

export const stockApi = {
  summary: endpoint((params) => http.get('/stock/summary', { params })),
  levels: endpoint((params) => http.get('/stock/levels', { params }), normalizeList),
  movements: endpoint((params) => http.get('/stock/movements', { params }), normalizeList),
  /** GET /stock/serials?productId&warehouseId&status=available */
  serials: endpoint((params) => http.get('/stock/serials', { params }), normalizeList),
  checkAvailability: endpoint((payload) => http.post('/stock/availability', payload)),
  adjust: endpoint((payload) => http.post('/stock/adjustments', payload)),
};
