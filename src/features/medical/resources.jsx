import { col, statusField, statusFilter } from '../../components/resource/columns';
import { StatusBadge } from '../../components/ui';
import { formatCurrency } from '../../utils/format';

const permissions = { create: 'medicalAids.create', edit: 'medicalAids.edit', delete: 'medicalAids.delete' };

export const medicalAidsConfig = {
  resource: 'medicalAids',
  title: 'Medical aids',
  singular: 'Medical aid',
  eyebrow: 'Medical aid',
  description: 'Medical schemes you claim from. Each medical aid has its own plans.',
  permissions,
  detailPath: (r) => `/medical-aids/${r.id}`,
  columns: [
    col.entity('name', 'Medical aid', 'code'),
    col.text('administrator', 'Administrator'),
    col.text('claimsEmail', 'Claims email'),
    col.text('planCount', 'Plans', { align: 'right' }),
    col.status(),
  ],
  filters: [statusFilter()],
  fields: [
    { name: 'name', label: 'Medical aid name', required: true, span: 8 },
    { name: 'code', label: 'Short code', required: true, span: 4 },
    { name: 'administrator', label: 'Administrator' },
    { name: 'phone', label: 'Telephone', type: 'tel' },
    { name: 'email', label: 'General email', type: 'email' },
    { name: 'claimsEmail', label: 'Claims email', type: 'email' },
    { name: 'website', label: 'Website', type: 'url' },
    statusField(),
    { name: 'notes', label: 'Notes', type: 'textarea', rows: 3, span: 12 },
  ],
};

export const medicalAidPlansConfig = {
  resource: 'medicalAidPlans',
  title: 'Medical aid plans',
  singular: 'Plan',
  eyebrow: 'Medical aid',
  description: 'Plans / options offered by each medical aid. Structure: Medical aid → Plans.',
  permissions,
  columns: [
    col.strong('name', 'Plan'),
    col.mono('code', 'Code'),
    col.text('medicalAidName', 'Medical aid'),
    col.text('membershipType', 'Membership type'),
    col.status(),
  ],
  filters: [
    { key: 'medicalAidId', label: 'Medical aids', options: { resource: 'medicalAids' } },
    { key: 'membershipType', label: 'Membership types', options: 'membershipType' },
    statusFilter(),
  ],
  fields: [
    { name: 'medicalAidId', label: 'Medical aid', type: 'select', required: true, options: { resource: 'medicalAids' }, span: 12 },
    { name: 'name', label: 'Plan name', required: true },
    { name: 'code', label: 'Plan code' },
    { name: 'membershipType', label: 'Membership type', type: 'select', options: 'membershipType' },
    statusField(),
    { name: 'benefitNotes', label: 'Hearing benefit notes', type: 'textarea', rows: 3, span: 12, hint: 'E.g. annual hearing aid limits or pre-authorisation rules.' },
  ],
  formSize: 'md',
  viewItems: (r) => [
    { label: 'Medical aid', value: r.medicalAidName },
    { label: 'Plan code', value: r.code },
    { label: 'Membership type', value: r.membershipType },
    { label: 'Hearing benefit notes', value: r.benefitNotes },
    { label: 'Status', value: <StatusBadge value={r.status} /> },
  ],
};

export const icdCodesConfig = {
  resource: 'icdCodes',
  title: 'ICD-10 codes',
  singular: 'ICD code',
  eyebrow: 'Medical aid',
  description: 'Diagnosis codes used on invoices and medical aid claims.',
  permissions,
  searchPlaceholder: 'Search code or description…',
  defaultSort: { sortBy: 'code', sortDir: 'asc' },
  columns: [col.mono('code', 'Code', { width: 110 }), col.text('description', 'Description'), col.text('category', 'Category'), col.status()],
  filters: [statusFilter()],
  fields: [
    { name: 'code', label: 'ICD-10 code', required: true, span: 4, placeholder: 'e.g. H90.3', pattern: '^[A-Z][0-9]{2}(\\.[0-9A-Z]{1,4})?$', patternMessage: 'Use ICD-10 format, e.g. H90.3' },
    { name: 'category', label: 'Category', span: 8 },
    { name: 'description', label: 'Description', type: 'textarea', required: true, rows: 3, span: 12 },
    statusField(),
  ],
  formSize: 'md',
  viewItems: (r) => [
    { label: 'Code', value: r.code },
    { label: 'Description', value: r.description },
    { label: 'Category', value: r.category },
    { label: 'Status', value: <StatusBadge value={r.status} /> },
  ],
};

export const procedureCodesConfig = {
  resource: 'procedureCodes',
  title: 'Procedure codes',
  singular: 'Procedure code',
  eyebrow: 'Medical aid',
  description: 'Tariff / procedure codes billed for services.',
  permissions,
  searchPlaceholder: 'Search code or description…',
  defaultSort: { sortBy: 'code', sortDir: 'asc' },
  columns: [col.mono('code', 'Code', { width: 110 }), col.text('description', 'Description'), col.currency('defaultPrice', 'Default price'), col.status()],
  filters: [statusFilter()],
  fields: [
    { name: 'code', label: 'Procedure code', required: true, span: 4 },
    { name: 'defaultPrice', label: 'Default price', type: 'currency', min: 0, span: 8 },
    { name: 'description', label: 'Description', type: 'textarea', required: true, rows: 3, span: 12 },
    statusField(),
  ],
  formSize: 'md',
  viewItems: (r) => [
    { label: 'Code', value: r.code },
    { label: 'Description', value: r.description },
    { label: 'Default price', value: formatCurrency(r.defaultPrice) },
    { label: 'Status', value: <StatusBadge value={r.status} /> },
  ],
};

export const CLAIM_FIELDS = [
  {
    name: 'patientId',
    label: 'Patient',
    type: 'async',
    resource: 'patients',
    labelField: 'patientName',
    required: true,
    getMeta: (r) => r.patientNumber,
    span: 12,
    onSelect: (r) =>
      r ? { medicalAidId: r.medicalAidId ?? '', medicalAidPlanId: r.medicalAidPlanId ?? '', membershipNumber: r.membershipNumber ?? '', invoiceId: '', invoiceNumber: '' } : {},
  },
  {
    name: 'invoiceId',
    label: 'Invoice',
    type: 'async',
    resource: 'invoices',
    labelField: 'invoiceNumber',
    params: (v) => ({ patientId: v.patientId }),
    getMeta: (r) => formatCurrency(r.total),
    hint: 'Optional — link the claim to an invoice',
  },
  { name: 'date', label: 'Claim date', type: 'date', required: true },
  { name: 'medicalAidId', label: 'Medical aid', type: 'select', required: true, options: { resource: 'medicalAids', params: { status: 'active' } } },
  { name: 'medicalAidPlanId', label: 'Plan', type: 'select', options: { resource: 'medicalAidPlans', dependsOn: 'medicalAidId' }, dependsOnMessage: 'Select a medical aid first' },
  { name: 'membershipNumber', label: 'Membership number', required: true },
  { name: 'amount', label: 'Claim amount', type: 'currency', required: true, min: 0 },
  { name: 'icdCodeIds', label: 'ICD-10 codes', type: 'multiselect', required: true, options: { resource: 'icdCodes' }, span: 12 },
  { name: 'procedureCodeIds', label: 'Procedure codes', type: 'multiselect', options: { resource: 'procedureCodes' }, span: 12 },
  { name: 'status', label: 'Status', type: 'select', required: true, options: { status: 'claim' } },
];

export const claimsConfig = {
  resource: 'claims',
  title: 'Medical claims',
  singular: 'Claim',
  eyebrow: 'Medical aid',
  description: 'Claims submitted to medical aids. Status values are configured in config/statuses.js.',
  permissions: { create: 'claims.create', edit: 'claims.edit', delete: 'claims.edit' },
  detailPath: (r) => `/claims/${r.id}`,
  defaultSort: { sortBy: 'date', sortDir: 'desc' },
  searchPlaceholder: 'Search claim number, patient or invoice…',
  columns: [
    col.strong('number', 'Claim number'),
    col.link('patientName', 'Patient', (r) => `/patients/${r.patientId}`),
    { key: 'medicalAidName', header: 'Medical aid / plan', sortable: true, render: (r) => <div>{r.medicalAidName}<div className="entity-sub">{r.planName}</div></div> },
    col.link('invoiceNumber', 'Invoice', (r) => `/invoices/${r.invoiceId}`),
    col.date('date', 'Date'),
    col.currency('amount', 'Amount'),
    col.status('claim'),
  ],
  filters: [
    { key: 'status', label: 'Statuses', options: { status: 'claim' } },
    { key: 'medicalAidId', label: 'Medical aids', options: { resource: 'medicalAids' } },
  ],
  fields: CLAIM_FIELDS,
  defaultValues: { status: 'draft', icdCodeIds: [], procedureCodeIds: [], date: new Date().toISOString().slice(0, 10) },
  toPayload: (v) => ({
    patientId: v.patientId,
    invoiceId: v.invoiceId || null,
    medicalAidId: v.medicalAidId,
    medicalAidPlanId: v.medicalAidPlanId || null,
    membershipNumber: v.membershipNumber,
    date: v.date || null,
    amount: Number(v.amount),
    status: v.status,
    icdCodeIds: v.icdCodeIds ?? [],
    procedureCodeIds: v.procedureCodeIds ?? [],
  }),
};
