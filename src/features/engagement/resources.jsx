import { Download } from 'lucide-react';
import { documentsApi } from '../../api';
import { APPOINTMENT_FIELDS } from '../../components/crm/AppointmentsPanel';
import { col } from '../../components/resource/columns';
import { optionLabel } from '../../config/statuses';
import { formatDate, formatDuration, formatFileSize } from '../../utils/format';

const CHANNEL_OPTIONS = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'call', label: 'Phone call' },
  { value: 'email', label: 'Email' },
];

const patientField = {
  name: 'patientId',
  label: 'Patient',
  type: 'async',
  resource: 'patients',
  labelField: 'patientName',
  required: true,
  getMeta: (r) => r.patientNumber,
  span: 12,
};

export const appointmentsConfig = {
  resource: 'appointments',
  title: 'Appointments',
  singular: 'Appointment',
  eyebrow: 'Patients',
  description: 'Hearing tests, fittings and follow-ups across all branches.',
  permissions: { create: 'patients.edit', edit: 'patients.edit', delete: 'patients.edit' },
  defaultSort: { sortBy: 'date', sortDir: 'desc' },
  searchPlaceholder: 'Search patient or staff member…',
  columns: [
    { key: 'date', header: 'Date', sortable: true, render: (a) => <div><div className="strong nowrap">{formatDate(a.date)}</div><div className="entity-sub">{a.time} · {a.durationMinutes ?? '—'} min</div></div> },
    col.link('patientName', 'Patient / lead', (a) => (a.patientId ? `/patients/${a.patientId}` : `/leads/${a.leadId}`)),
    { key: 'type', header: 'Type', render: (a) => optionLabel('appointmentType', a.type) },
    col.text('branchName', 'Branch'),
    col.text('staffName', 'Staff member'),
    col.status('appointment'),
  ],
  filters: [
    { key: 'when', label: 'Dates', options: [{ value: 'upcoming', label: 'Upcoming' }, { value: 'past', label: 'Past' }] },
    { key: 'status', label: 'Statuses', options: { status: 'appointment' } },
    { key: 'type', label: 'Types', options: 'appointmentType' },
    { key: 'branchId', label: 'Branches', options: { resource: 'branches' } },
  ],
  fields: [patientField, ...APPOINTMENT_FIELDS],
  defaultValues: { status: 'scheduled', durationMinutes: 30, type: 'hearing_test' },
  formSize: 'lg',
};

export const communicationsConfig = {
  resource: 'communications',
  title: 'Communications',
  singular: 'Communication',
  eyebrow: 'Relationships',
  description: 'WhatsApp messages, phone calls and emails with patients and leads. Log a manual entry from the patient or lead profile.',
  permissions: { create: 'patients.edit', edit: 'patients.edit', delete: 'patients.edit' },
  readOnly: true,
  defaultSort: { sortBy: 'occurredAt', sortDir: 'desc' },
  searchPlaceholder: 'Search message, subject or number…',
  columns: [
    col.dateTime('occurredAt', 'When'),
    { key: 'channel', header: 'Channel', sortable: true, render: (c) => CHANNEL_OPTIONS.find((o) => o.value === c.channel)?.label ?? c.channel },
    { key: 'direction', header: 'Direction', render: (c) => optionLabel('direction', c.direction) },
    { key: 'summary', header: 'Summary', render: (c) => <div style={{ maxWidth: 420 }}>{c.subject && <div className="strong">{c.subject}</div>}<div className="text-sm muted truncate">{c.summary}</div></div> },
    { key: 'to', header: 'From / to', render: (c) => <div className="text-sm">{c.from}<div className="entity-sub">→ {c.to}</div></div> },
    { key: 'durationSeconds', header: 'Duration', render: (c) => (c.channel === 'call' ? formatDuration(c.durationSeconds) : '—') },
    col.status('communication'),
  ],
  filters: [
    { key: 'channel', label: 'Channels', options: CHANNEL_OPTIONS },
    { key: 'direction', label: 'Directions', options: 'direction' },
    { key: 'status', label: 'Statuses', options: { status: 'communication' } },
  ],
  viewItems: (c) => [
    { label: 'Channel', value: CHANNEL_OPTIONS.find((o) => o.value === c.channel)?.label },
    { label: 'Direction', value: optionLabel('direction', c.direction) },
    { label: 'From', value: c.from },
    { label: 'To', value: c.to },
    { label: 'Subject', value: c.subject },
    { label: 'Summary', value: c.summary },
    { label: 'Staff member', value: c.staffName },
  ],
};

export const documentsConfig = {
  resource: 'documents',
  title: 'Documents',
  singular: 'Document',
  eyebrow: 'Patients',
  description: 'Audiograms, ID copies, medical aid cards and claim documents. Upload new documents from the patient profile.',
  permissions: { delete: 'patients.edit' },
  defaultSort: { sortBy: 'uploadedAt', sortDir: 'desc' },
  searchPlaceholder: 'Search file name…',
  columns: [
    col.strong('name', 'File'),
    { key: 'type', header: 'Type', sortable: true, render: (d) => optionLabel('documentType', d.type) },
    { key: 'size', header: 'Size', render: (d) => formatFileSize(d.size) },
    col.text('uploadedBy', 'Uploaded by'),
    col.dateTime('uploadedAt', 'Uploaded'),
  ],
  filters: [{ key: 'type', label: 'Types', options: 'documentType' }],
  rowExtraActions: (d) => [
    { label: 'Download', icon: Download, onClick: () => documentsApi.download(d.id, d.name) },
  ],
  allowCreate: false,
  allowEdit: false,
};
