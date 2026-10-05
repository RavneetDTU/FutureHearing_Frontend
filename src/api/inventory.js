import { http } from './client';
import { createResource, endpoint, normalizeList } from './resource';

export const warehousesApi = createResource('/warehouses', 'warehouses');
export const branchesApi = createResource('/branches', 'branches');
export const practicesApi = createResource('/practices', 'practices');
export const suppliersApi = createResource('/suppliers', 'suppliers');

export const stockApi = {
  summary: endpoint('stock.summary', (params) => http.get('/stock/summary', { params })),
  levels: endpoint('stock.levels', (params) => http.get('/stock/levels', { params }), normalizeList),
  movements: endpoint('stock.movements', (params) => http.get('/stock/movements', { params }), normalizeList),
  /** GET /stock/serials?productId&warehouseId&status=available */
  serials: endpoint('stock.serials', (params) => http.get('/stock/serials', { params }), normalizeList),
  checkAvailability: endpoint('stock.availability', (payload) => http.post('/stock/availability', payload)),
  adjust: endpoint('stock.adjust', (payload) => http.post('/stock/adjustments', payload)),
};
