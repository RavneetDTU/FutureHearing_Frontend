import { downloadFile, http } from './client';
import { createResource, endpoint, normalizeArray } from './resource';

/**
 * POST /invoices with `type: 'quote' | 'proforma' | 'invoice'`. Creating a final invoice may be rejected
 * (409/422 { message }) when stock is unavailable in the selected warehouse.
 */
export const invoicesApi = {
  ...createResource('/invoices'),
  calculateTotals: endpoint((payload) => http.post('/invoices/calculate', payload)),
  convertToInvoice: endpoint((id) => http.post(`/invoices/${id}/convert`)),
  /** POST /invoices/:id/cancel — restores stock when the invoice has no payments. */
  cancel: endpoint((id) => http.post(`/invoices/${id}/cancel`)),
  history: endpoint((id) => http.get(`/invoices/${id}/history`), normalizeArray),
  downloadPdf: (id, filename) => downloadFile(`/invoices/${id}/pdf`, { filename: filename || 'invoice.pdf' }),
  email: endpoint((id, payload) => http.post(`/invoices/${id}/email`, payload || {})),
};

/** Full Test = predefined group of service products. Full CRUD. */
export const fullTestsApi = createResource('/full-tests');

export const paymentsApi = createResource('/payments');
export const refundsApi = createResource('/refunds');

export const purchasesApi = {
  ...createResource('/purchases'),
  complete: endpoint((id) => http.post(`/purchases/${id}/complete`)),
};
