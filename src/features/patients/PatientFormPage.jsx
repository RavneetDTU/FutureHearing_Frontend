import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { leadsApi, patientsApi } from '../../api';
import { statusField } from '../../components/resource/columns';
import { Alert, Button, Card, CardBody, PageHeader, QueryState, SchemaForm } from '../../components/ui';
import { useToast } from '../../context/ToastContext';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useForm } from '../../hooks/useForm';
import { useMutation } from '../../hooks/useMutation';

export const PATIENT_FIELDS = [
  { name: 'h-personal', type: 'heading', label: 'Personal details' },
  { name: 'title', label: 'Title', type: 'select', options: 'title', span: 3 },
  { name: 'firstName', label: 'First name', required: true, span: 4 },
  { name: 'lastName', label: 'Surname', required: true, span: 5 },
  { name: 'idNumber', label: 'ID / passport number', span: 4 },
  { name: 'dateOfBirth', label: 'Date of birth', type: 'date', span: 4 },
  { name: 'gender', label: 'Gender', type: 'select', options: 'gender', span: 4 },
  { name: 'h-contact', type: 'heading', label: 'Contact' },
  { name: 'mobile', label: 'Mobile', type: 'tel', required: true },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'address', label: 'Address', type: 'textarea', rows: 2, span: 12 },
  { name: 'h-branches', type: 'heading', label: 'Branches', hint: 'A patient can be seen at more than one branch.' },
  { name: 'branchIds', label: 'Branches', type: 'multiselect', required: true, options: { resource: 'branches', params: { status: 'active' } }, span: 12 },
  { name: 'h-aid', type: 'heading', label: 'Medical aid', hint: 'Leave empty for private (cash) patients.' },
  { name: 'medicalAidId', label: 'Medical aid', type: 'select', options: { resource: 'medicalAids', params: { status: 'active' } } },
  { name: 'medicalAidPlanId', label: 'Plan / option', type: 'select', options: { resource: 'medicalAidPlans', dependsOn: 'medicalAidId' }, dependsOnMessage: 'Select a medical aid first' },
  { name: 'membershipNumber', label: 'Membership number', span: 4, visibleWhen: (v) => Boolean(v.medicalAidId), required: true },
  { name: 'dependantCode', label: 'Dependant code', span: 4, visibleWhen: (v) => Boolean(v.medicalAidId) },
  { name: 'mainMember', label: 'Main member', span: 4, visibleWhen: (v) => Boolean(v.medicalAidId) },
  { name: 'h-other', type: 'heading', label: 'Other' },
  { name: 'referredBy', label: 'Referred by' },
  statusField(),
  { name: 'notes', label: 'Notes', type: 'textarea', rows: 3, span: 12 },
];

const PATIENT_WRITE = [
  'title',
  'firstName',
  'lastName',
  'idNumber',
  'dateOfBirth',
  'gender',
  'mobile',
  'email',
  'address',
  'branchIds',
  'medicalAidId',
  'medicalAidPlanId',
  'membershipNumber',
  'dependantCode',
  'mainMember',
  'referredBy',
  'notes',
  'status',
  'leadId',
];

function toPatientPayload(values, leadId) {
  const src = { ...values, leadId: leadId || values.leadId || null };
  return Object.fromEntries(PATIENT_WRITE.filter((key) => src[key] !== undefined).map((key) => [key, src[key]]));
}

function PatientForm({ record, patientId, leadId }) {
  const navigate = useNavigate();
  const toast = useToast();
  const form = useForm(record, PATIENT_FIELDS);
  const save = useMutation((payload) => (patientId ? patientsApi.update(patientId, payload) : patientsApi.create(payload)));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.validate()) return;
    try {
      await save.mutate(toPatientPayload(form.values, leadId));
      toast.success(patientId ? 'Patient updated' : 'Patient created', `${form.values.firstName} ${form.values.lastName}`);
      navigate(patientId ? `/patients/${patientId}` : '/patients');
    } catch (err) {
      form.applyServerErrors(err);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="stack">
      {leadId && <Alert tone="info" title="Imported from lead">Details were pre-filled from the lead. Review before saving.</Alert>}
      {save.error && (
        <Alert tone="danger" title="Could not save patient">
          {save.error.message}
        </Alert>
      )}
      <Card>
        <CardBody>
          <SchemaForm fields={PATIENT_FIELDS} form={form} />
        </CardBody>
      </Card>
      <div className="form-actions">
        <Button onClick={() => navigate(-1)} disabled={save.loading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={save.loading}>
          {patientId ? 'Save changes' : 'Create patient'}
        </Button>
      </div>
    </form>
  );
}

function leadToPatient(lead) {
  const [firstName, ...rest] = (lead.fullName ?? '').split(' ');
  return {
    status: 'active',
    firstName,
    lastName: rest.join(' '),
    mobile: lead.phone,
    email: lead.email,
    branchIds: lead.branchId ? [lead.branchId] : [],
  };
}

export function PatientFormPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const leadId = params.get('leadId');
  const patient = useApiQuery(() => patientsApi.get(id), [id], { enabled: Boolean(id) });
  const lead = useApiQuery(() => leadsApi.get(leadId), [leadId], { enabled: Boolean(leadId) && !id });

  const title = id ? `Edit ${patient.data?.fullName ?? 'patient'}` : 'Add patient';
  const q = id ? patient : leadId ? lead : null;

  return (
    <>
      <PageHeader eyebrow="Relationships" title={title} description="Fields marked * are required." />
      {q ? (
        <QueryState loading={q.loading} error={q.error} onRetry={q.refetch} resource={id ? 'patient' : 'lead'}>
          {q.data && <PatientForm key={q.data.id} record={id ? q.data : leadToPatient(q.data)} patientId={id} leadId={id ? null : leadId} />}
        </QueryState>
      ) : (
        <PatientForm record={{ status: 'active', branchIds: [] }} />
      )}
    </>
  );
}
