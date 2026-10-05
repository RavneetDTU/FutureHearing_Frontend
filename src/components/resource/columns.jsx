import { Link } from 'react-router-dom';
import { EntityCell, StatusBadge } from '../ui';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/format';

/** Reusable column factories for DataTable configs. */
export const col = {
  text: (key, header, extra = {}) => ({ key, header, sortable: true, ...extra }),
  strong: (key, header, extra = {}) => ({
    key,
    header,
    sortable: true,
    render: (r) => <span className="strong">{r[key] ?? '—'}</span>,
    ...extra,
  }),
  mono: (key, header, extra = {}) => ({
    key,
    header,
    sortable: true,
    render: (r) => <span className="mono">{r[key] ?? '—'}</span>,
    ...extra,
  }),
  entity: (key, header, subKey, extra = {}) => ({
    key,
    header,
    sortable: true,
    render: (r) => <EntityCell name={r[key]} subtitle={subKey ? r[subKey] : undefined} size="sm" />,
    ...extra,
  }),
  link: (key, header, to, extra = {}) => ({
    key,
    header,
    sortable: true,
    render: (r) =>
      r[key] ? (
        <Link to={to(r)} className="strong" onClick={(e) => e.stopPropagation()}>
          {r[key]}
        </Link>
      ) : (
        <span className="subtle">—</span>
      ),
    ...extra,
  }),
  currency: (key, header, extra = {}) => ({
    key,
    header,
    sortable: true,
    align: 'right',
    render: (r) => <span className="nowrap">{formatCurrency(r[key])}</span>,
    ...extra,
  }),
  date: (key, header, extra = {}) => ({
    key,
    header,
    sortable: true,
    render: (r) => <span className="nowrap">{formatDate(r[key])}</span>,
    ...extra,
  }),
  dateTime: (key, header, extra = {}) => ({
    key,
    header,
    sortable: true,
    render: (r) => <span className="nowrap">{formatDateTime(r[key])}</span>,
    ...extra,
  }),
  status: (domain = 'record', key = 'status', header = 'Status') => ({
    key,
    header,
    sortable: true,
    render: (r) => <StatusBadge domain={domain} value={r[key]} />,
  }),
};

export const statusFilter = (domain = 'record') => ({ key: 'status', label: 'Status', options: { status: domain } });
export const statusField = (domain = 'record', extra = {}) => ({
  name: 'status',
  label: 'Status',
  type: 'select',
  required: true,
  options: { status: domain },
  ...extra,
});
