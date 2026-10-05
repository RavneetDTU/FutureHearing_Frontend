/**
 * ⚠️ MOCK ADAPTER — DEVELOPMENT ONLY.
 * Answers service calls with the response envelope the real API is expected to return, so the UI
 * can be built before the backend exists. It is NOT a backend:
 *   - fixtures are read-only; create/update/delete calls echo the payload back and change nothing;
 *   - nothing is persisted anywhere;
 *   - no business rules beyond trivial filtering/pagination needed to render screens.
 * Loaded lazily only when VITE_USE_MOCK_API is enabled (see src/api/resource.js).
 */
import * as db from './data';
import { ApiError } from '../api/client';

const LATENCY_MS = 300;
const respond = (value) =>
  new Promise((resolve) => setTimeout(() => resolve(value === undefined ? null : structuredClone(value)), LATENCY_MS));
const fail = (message, status = 422, fieldErrors) =>
  new Promise((_, reject) => setTimeout(() => reject(new ApiError(message, { status, fieldErrors })), LATENCY_MS));

function collection(key) {
  const items = db.collections[key];
  if (!items) throw new Error(`[mock] Unknown collection "${key}"`);
  return items;
}

function query(items, params = {}) {
  const { page = 1, pageSize = 10, search, sortBy, sortDir = 'asc', ...filters } = params;
  let rows = items;

  if (search) {
    const q = String(search).toLowerCase();
    rows = rows.filter((row) =>
      Object.values(row).some((v) => (typeof v === 'string' || typeof v === 'number') && String(v).toLowerCase().includes(q)),
    );
  }

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    // Ignore params that aren't fields of this collection (e.g. UI-only params).
    if (!items.some((row) => key in row)) return;
    rows = rows.filter((row) => {
      const field = row[key];
      return Array.isArray(field) ? field.map(String).includes(String(value)) : String(field) === String(value);
    });
  });

  if (sortBy) {
    const dir = sortDir === 'desc' ? -1 : 1;
    rows = [...rows].sort((a, b) => {
      const x = a[sortBy] ?? '';
      const y = b[sortBy] ?? '';
      return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y))) * dir;
    });
  }

  const size = Number(pageSize);
  const start = (Number(page) - 1) * size;
  return { data: rows.slice(start, start + size), meta: { page: Number(page), pageSize: size, total: rows.length } };
}

const labelOf = (row) => row.name ?? row.fullName ?? row.number ?? row.code;

const TODAY = '2026-10-02';

export function list(key, params = {}) {
  // `when=upcoming|past` mirrors the documented appointments query param.
  if (key === 'appointments' && params.when) {
    const { when, ...rest } = params;
    const rows = db.appointments
      .filter((a) => (when === 'upcoming' ? a.date >= TODAY : a.date < TODAY))
      .sort((a, b) => (when === 'upcoming' ? 1 : -1) * a.date.localeCompare(b.date));
    return respond(query(rows, rest));
  }
  return respond(query(collection(key), params));
}

export function lookup(key, params = {}) {
  const { data } = query(collection(key), { ...params, page: 1, pageSize: 50 });
  return respond({
    data: data.map((row) => ({
      ...row,
      id: row.id,
      name: row.code && row.description ? `${row.code} — ${row.description}` : labelOf(row),
    })),
  });
}

export function get(key, id) {
  const row = collection(key).find((r) => String(r.id) === String(id));
  return row ? respond({ data: row }) : fail('Record not found.', 404);
}

function hasShortStock(warehouseId, lines = []) {
  return lines.some((l) => {
    if (l.type !== 'standard') return false;
    const level = db.stockLevels.find((s) => s.productId === l.productId && s.warehouseId === warehouseId);
    return (level?.available ?? 0) < Number(l.quantity || 0);
  });
}

export function create(key, payload) {
  if (key === 'invoices' && payload?.type === 'invoice' && hasShortStock(payload.warehouseId, payload.lines)) {
    return fail('Insufficient stock in the selected warehouse.', 409);
  }
  return respond({ data: { id: `mock-${Date.now()}`, ...payload } });
}

export function update(key, id, payload) {
  const row = collection(key).find((r) => String(r.id) === String(id)) || {};
  return respond({ data: { ...row, ...payload, id } });
}

export function remove() {
  return respond(null);
}

const handlers = {
  'auth.me': () => respond({ data: db.currentUser }),
  'auth.login': () => respond({ data: { user: db.currentUser, token: 'mock-session' } }),
  'auth.logout': () => respond(null),
  'auth.forgot': () => respond({ data: { message: 'If an account exists, password reset instructions have been created.' } }),
  'auth.reset': () => respond({ data: { message: 'Password updated.' } }),

  'dashboard.summary': () =>
    respond({
      data: {
        ...db.dashboard,
        branches: db.branches.map((b) => ({
          ...b,
          patients: db.patients.filter((p) => p.branchIds.includes(b.id)).length,
          openInvoices: db.invoices.filter((i) => i.branchId === b.id && i.balance > 0).length,
          lowStock: db.stockLevels.filter((s) => s.branchId === b.id && s.status !== 'in_stock').length,
        })),
        stock: db.stockLevels.filter((s) => s.status !== 'in_stock'),
        recentActivity: db.activities.slice(0, 8),
        recentInvoices: db.invoices.slice(0, 5),
        recentPatients: db.patients.slice(0, 5),
        recentClaims: db.claims.slice(0, 5),
      },
    }),

  'notifications.list': () => respond({ data: db.notifications }),
  'notifications.read': (id) => respond({ data: { id, read: true } }),
  'notifications.readAll': () => respond({ data: { read: true } }),
  'permissions.catalogue': () => respond({ data: db.permissionCatalogue }),
  'settings.get': (section) => respond({ data: db.settings[section] ?? {} }),
  'settings.update': (section, payload) => respond({ data: payload }),

  'stock.summary': (params = {}) => {
    const rows = db.stockLevels.filter((s) => !params.branchId || s.branchId === params.branchId);
    const group = (key, label) =>
      Object.values(
        rows.reduce((acc, r) => {
          const id = r[key];
          acc[id] ??= { id, name: label(r), units: 0, products: 0, low: 0 };
          acc[id].units += r.onHand;
          acc[id].products += 1;
          if (r.status !== 'in_stock') acc[id].low += 1;
          return acc;
        }, {}),
      );
    return respond({
      data: {
        totals: {
          totalUnits: rows.reduce((n, r) => n + r.onHand, 0),
          lowStock: rows.filter((r) => r.status === 'low').length,
          outOfStock: rows.filter((r) => r.status === 'out').length,
          stockValue: 412560,
        },
        byBranch: group('branchId', (r) => r.branchName),
        byWarehouse: group('warehouseId', (r) => `${r.branchName} · ${r.warehouseName}`),
      },
    });
  },
  'stock.levels': (params) => respond(query(db.stockLevels, params)),
  'stock.movements': (params) => respond(query(db.stockMovements, params)),
  'stock.availability': ({ warehouseId, lines = [] }) =>
    respond({
      data: {
        lines: lines.map((line) => {
          const level = db.stockLevels.find((s) => s.productId === line.productId && s.warehouseId === warehouseId);
          const available = level?.available ?? 0;
          const sufficient = available >= Number(line.quantity || 0);
          return {
            productId: line.productId,
            available,
            sufficient,
            message: sufficient ? null : 'Insufficient stock in the selected warehouse.',
          };
        }),
      },
    }),
  'stock.adjust': (payload) => respond({ data: { id: `mock-adj-${Date.now()}`, ...payload, status: 'accepted' } }),
  'stock.serials': (params = {}) => {
    const rows = db.stockLevels
      .filter((s) => (!params.productId || s.productId === params.productId) && (!params.warehouseId || s.warehouseId === params.warehouseId))
      .flatMap((s) =>
        Array.from({ length: Math.min(s.available, 3) }, (_, i) => ({
          id: `sn-${s.id}-${i}`,
          name: `${s.sku}-${i + 1}`,
          serialNumber: `${s.sku}-${i + 1}`,
          productId: s.productId,
          warehouseId: s.warehouseId,
          status: 'available',
        })),
      );
    return respond(query(rows, params));
  },

  'invoices.calculateTotals': ({ lines = [] }) => {
    const subtotal = lines.reduce((n, l) => n + Number(l.quantity || 0) * Number(l.unitPrice || 0), 0);
    const vat = lines.reduce((n, l) => n + Number(l.quantity || 0) * Number(l.unitPrice || 0) * (Number(l.vatRate || 0) / 100), 0);
    return respond({ data: { subtotal, vat, discount: 0, total: subtotal + vat } });
  },
  'invoices.cancel': (id) => {
    const inv = db.invoices.find((i) => i.id === id);
    if (!inv) return fail('Record not found.', 404);
    if (inv.balance < inv.total) return fail('An invoice with payments cannot be cancelled.', 409);
    return respond({ data: { ...inv, status: 'cancelled' } });
  },
  'invoices.email': () => respond({ data: { sent: true } }),
  'invoices.convert': (id) => {
    const inv = db.invoices.find((i) => i.id === id);
    if (!inv) return fail('Record not found.', 404);
    if (hasShortStock(inv.warehouseId, inv.lines)) return fail('Insufficient stock in the selected warehouse.', 409);
    return respond({ data: { ...inv, type: 'invoice', status: 'unpaid', number: inv.number.replace(/^(QUO|PRO)/, 'INV') } });
  },
  'invoices.history': (id) => {
    const inv = db.invoices.find((i) => i.id === id);
    return respond({
      data: inv
        ? [
            { id: 'h1', type: 'invoice', title: `${inv.type === 'invoice' ? 'Invoice' : 'Quote'} created`, actorName: inv.createdByName, occurredAt: `${inv.date}T09:00:00` },
            ...db.payments.filter((p) => p.invoiceId === id).map((p) => ({ id: p.id, type: 'payment', title: `Payment ${p.status}`, description: `${p.method} · ${p.reference}`, actorName: inv.createdByName, occurredAt: `${p.date}T12:00:00` })),
          ]
        : [],
    });
  },

  'purchases.complete': (id) => {
    const pur = db.purchases.find((p) => p.id === id);
    const missing = pur?.lines.some((l) => l.trackSerials && l.serialNumbers.filter(Boolean).length < l.quantity);
    if (missing) return fail('Serial numbers are required for every unit before completing this purchase.', 422);
    return respond({ data: { ...pur, status: 'completed' } });
  },

  'leads.convert': (id) => respond({ data: { leadId: id, patientId: 'pt-1' } }),
  'claims.updateStatus': (id, payload) => respond({ data: { ...db.claims.find((c) => c.id === id), ...payload } }),
  'documents.upload': () => respond({ data: { id: `mock-doc-${Date.now()}` } }),
  'icdCodes.import': () => respond({ data: { imported: 0, skipped: 0, errors: [] } }),
};

export function handle(name, ...args) {
  const handler = handlers[name];
  if (!handler) return fail(`[mock] No handler for "${name}"`, 501);
  return handler(...args);
}
