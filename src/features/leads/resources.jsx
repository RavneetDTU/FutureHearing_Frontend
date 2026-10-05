import { col } from '../../components/resource/columns';
import { StatusBadge } from '../../components/ui';
import { optionLabel } from '../../config/statuses';

export const LEAD_FIELDS = [
  { name: 'fullName', label: 'Full name', required: true, span: 12 },
  { name: 'phone', label: 'Phone', type: 'tel', required: true },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'source', label: 'Source', type: 'select', required: true, options: 'leadSource' },
  { name: 'status', label: 'Status', type: 'select', required: true, options: { status: 'lead' } },
  { name: 'branchId', label: 'Branch', type: 'select', options: { resource: 'branches', params: { status: 'active' } } },
  { name: 'assignedToId', label: 'Assigned to', type: 'select', options: { resource: 'users', params: { status: 'active' } } },
  { name: 'interest', label: 'Interest / enquiry', type: 'textarea', rows: 3, span: 12 },
];

export const leadsConfig = {
  resource: 'leads',
  title: 'Leads',
  singular: 'Lead',
  eyebrow: 'Relationships',
  description: 'Prospective patients from the website, social media, referrals and walk-ins.',
  permissions: { create: 'leads.create', edit: 'leads.edit', delete: 'leads.delete' },
  detailPath: (r) => `/leads/${r.id}`,
  defaultSort: { sortBy: 'createdAt', sortDir: 'desc' },
  searchPlaceholder: 'Search name, phone or email…',
  columns: [
    col.entity('fullName', 'Lead', 'phone'),
    col.text('interest', 'Interest', { sortable: false }),
    { key: 'source', header: 'Source', sortable: true, render: (r) => optionLabel('leadSource', r.source) },
    col.text('assignedToName', 'Assigned to'),
    col.text('branchName', 'Branch'),
    col.dateTime('createdAt', 'Created'),
    col.status('lead'),
  ],
  filters: [
    { key: 'status', label: 'Statuses', options: { status: 'lead' } },
    { key: 'source', label: 'Sources', options: 'leadSource' },
    { key: 'assignedToId', label: 'Assignees', options: { resource: 'users' } },
    { key: 'branchId', label: 'Branches', options: { resource: 'branches' } },
  ],
  fields: LEAD_FIELDS,
  defaultValues: { status: 'new', source: 'website' },
  formSize: 'md',
  viewItems: (r) => [
    { label: 'Status', value: <StatusBadge domain="lead" value={r.status} /> },
  ],
};
