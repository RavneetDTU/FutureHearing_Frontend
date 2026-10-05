import { CalendarPlus, Pencil, XCircle } from 'lucide-react';
import { useState } from 'react';
import { appointmentsApi } from '../../api';
import { optionLabel } from '../../config/statuses';
import { useToast } from '../../context/ToastContext';
import { useListQuery } from '../../hooks/useListQuery';
import { formatDate } from '../../utils/format';
import { EntityFormModal } from '../resource/EntityFormModal';
import { Button, Card, CardHeader, DataTable, Pagination, StatusBadge } from '../ui';

export const APPOINTMENT_FIELDS = [
  { name: 'date', label: 'Date', type: 'date', required: true, span: 4 },
  { name: 'time', label: 'Time', type: 'time', required: true, span: 4 },
  { name: 'durationMinutes', label: 'Duration (min)', type: 'number', min: 5, step: 5, span: 4 },
  { name: 'type', label: 'Appointment type', type: 'select', required: true, options: 'appointmentType' },
  { name: 'status', label: 'Status', type: 'select', required: true, options: { status: 'appointment' } },
  { name: 'branchId', label: 'Branch', type: 'select', required: true, options: { resource: 'branches', params: { status: 'active' } } },
  { name: 'staffId', label: 'Staff member', type: 'select', options: { resource: 'users', dependsOn: 'branchId', param: 'branchIds' }, dependsOnMessage: 'Select a branch first' },
  { name: 'notes', label: 'Notes', type: 'textarea', rows: 3, span: 12 },
];

const columns = [
  { key: 'date', header: 'Date', render: (a) => <div><div className="strong nowrap">{formatDate(a.date)}</div><div className="entity-sub">{a.time} · {a.durationMinutes ?? '—'} min</div></div> },
  { key: 'type', header: 'Type', render: (a) => optionLabel('appointmentType', a.type) },
  { key: 'branchName', header: 'Branch' },
  { key: 'staffName', header: 'Staff member' },
  { key: 'notes', header: 'Notes', render: (a) => <span className="text-sm muted">{a.notes || '—'}</span> },
  { key: 'status', header: 'Status', render: (a) => <StatusBadge domain="appointment" value={a.status} /> },
];

function AppointmentList({ owner, when, title, onEdit, onCancel }) {
  const list = useListQuery(appointmentsApi.list, { baseParams: { ...owner, when }, pageSize: 5 });
  return (
    <Card flush>
      <CardHeader title={title} />
      <DataTable
        compact
        resource={`${title.toLowerCase()}`}
        rows={list.items}
        loading={list.loading}
        error={list.error}
        onRetry={list.refetch}
        columns={columns}
        rowActions={(a) => [
          { label: 'Edit', icon: Pencil, onClick: () => onEdit(a) },
          { label: 'Cancel appointment', icon: XCircle, danger: true, hidden: when === 'past' || a.status === 'cancelled', onClick: () => onCancel(a) },
        ]}
      />
      {list.total > list.pageSize && <Pagination page={list.page} pageSize={list.pageSize} total={list.total} onPageChange={list.setPage} />}
    </Card>
  );
}

/** owner: { patientId } | { leadId } */
export function AppointmentsPanel({ owner, defaults = {} }) {
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey((k) => k + 1);

  const cancel = async (a) => {
    try {
      await appointmentsApi.update(a.id, { status: 'cancelled' });
      toast.success('Appointment cancelled');
      refresh();
    } catch (err) {
      toast.error('Unable to cancel appointment', err.message);
    }
  };

  return (
    <div className="stack">
      <div className="row" style={{ justifyContent: 'flex-end' }}>
        <Button variant="primary" size="sm" icon={CalendarPlus} onClick={() => setForm({ status: 'scheduled', durationMinutes: 30, type: 'consultation', ...defaults })}>
          New appointment
        </Button>
      </div>
      <AppointmentList key={`u${refreshKey}`} owner={owner} when="upcoming" title="Upcoming appointments" onEdit={setForm} onCancel={cancel} />
      <AppointmentList key={`p${refreshKey}`} owner={owner} when="past" title="Past appointments" onEdit={setForm} onCancel={cancel} />
      <EntityFormModal
        open={Boolean(form)}
        onClose={() => setForm(null)}
        title={form?.id ? 'Edit appointment' : 'New appointment'}
        description="Availability and calendar rules are checked by the backend."
        fields={APPOINTMENT_FIELDS}
        initialValues={form ?? {}}
        submitLabel={form?.id ? 'Save changes' : 'Book appointment'}
        onSubmit={async (values) => {
          if (form.id) await appointmentsApi.update(form.id, values);
          else await appointmentsApi.create({ ...owner, ...values });
          toast.success(form.id ? 'Appointment updated' : 'Appointment booked');
          setForm(null);
          refresh();
        }}
      />
    </div>
  );
}
