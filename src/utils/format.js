const LOCALE = 'en-ZA';
const CURRENCY = 'ZAR';

const currencyFmt = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY });
const numberFmt = new Intl.NumberFormat(LOCALE);
const dateFmt = new Intl.DateTimeFormat(LOCALE, { day: '2-digit', month: 'short', year: 'numeric' });
const dateTimeFmt = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const EMPTY = '—';

export const formatCurrency = (v) => (v === null || v === undefined || v === '' ? EMPTY : currencyFmt.format(Number(v)));
export const formatNumber = (v) => (v === null || v === undefined || v === '' ? EMPTY : numberFmt.format(Number(v)));

function toDate(v) {
  if (!v) return null;
  const d = new Date(v.length === 10 ? `${v}T00:00:00` : v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export const formatDate = (v) => {
  const d = toDate(v);
  return d ? dateFmt.format(d) : EMPTY;
};

export const formatDateTime = (v) => {
  const d = toDate(v);
  return d ? dateTimeFmt.format(d) : EMPTY;
};

export function formatRelative(v) {
  const d = toDate(v);
  if (!d) return EMPTY;
  const diff = (Date.now() - d.getTime()) / 1000;
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' });
  if (abs < 3600) return rtf.format(-Math.round(diff / 60), 'minute');
  if (abs < 86400) return rtf.format(-Math.round(diff / 3600), 'hour');
  if (abs < 86400 * 30) return rtf.format(-Math.round(diff / 86400), 'day');
  return formatDate(v);
}

export function formatDuration(seconds) {
  if (!seconds) return EMPTY;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

export function formatFileSize(bytes) {
  if (!bytes) return EMPTY;
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${units[i]}`;
}

export function initials(name = '') {
  return (
    String(name)
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join('') || '?'
  );
}

export function invoicePaidAmount(inv) {
  if (inv?.paidAmount != null && inv.paidAmount !== '') return Number(inv.paidAmount);
  return Math.max(0, Number(inv?.total || 0) - Number(inv?.balance || 0));
}

export function invoicePaymentStatus(inv) {
  if (inv?.status === 'cancelled') return 'cancelled';
  if (inv?.status === 'overdue') return 'overdue';
  if (inv?.paymentStatus) return inv.paymentStatus;
  const total = Number(inv?.total || 0);
  const balance = Number(inv?.balance || 0);
  if (total > 0 && balance <= 0) return 'paid';
  if (balance > 0 && balance < total) return 'partial';
  return 'unpaid';
}
