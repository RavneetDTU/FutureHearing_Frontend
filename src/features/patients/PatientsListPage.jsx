import { FilePlus2, UserRoundPlus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { col, statusFilter } from '../../components/resource/columns';
import { ResourceListPage } from '../../components/resource/ResourceListPage';
import { AsyncSelect, Button, FormField, Modal } from '../../components/ui';
import { formatDate } from '../../utils/format';

function ImportLeadModal({ open, onClose }) {
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title="Import lead data"
      description="Create a patient pre-filled with an existing lead's details."
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" icon={UserRoundPlus} disabled={!lead} onClick={() => navigate(`/patients/new?leadId=${lead.id}`)}>
            Continue
          </Button>
        </>
      }
    >
      <FormField label="Lead" required>
        {({ id }) => (
          <AsyncSelect
            id={id}
            resource="leads"
            value={lead?.id}
            valueLabel={lead?.fullName}
            placeholder="Search leads by name, phone or email…"
            getMeta={(l) => l.phone}
            onChange={(_, row) => setLead(row)}
          />
        )}
      </FormField>
    </Modal>
  );
}

export const patientsConfig = {
  resource: 'patients',
  title: 'Patients',
  singular: 'Patient',
  eyebrow: 'Relationships',
  description: 'Branch-scoped patient records. A patient can be linked to more than one branch.',
  permissions: { create: 'patients.create', edit: 'patients.edit', delete: 'patients.delete' },
  createPath: '/patients/new',
  createLabel: 'Add patient',
  detailPath: (r) => `/patients/${r.id}`,
  editPath: (r) => `/patients/${r.id}/edit`,
  searchPlaceholder: 'Name, surname, mobile, ID or patient number…',
  columns: [
    col.entity('fullName', 'Patient', 'patientNumber'),
    { key: 'mobile', header: 'Contact', render: (r) => <div><div className="nowrap">{r.mobile}</div><div className="entity-sub">{r.email}</div></div> },
    col.text('branchNames', 'Branches'),
    { key: 'medicalAidName', header: 'Medical aid', sortable: true, render: (r) => (r.medicalAidName ? <div>{r.medicalAidName}<div className="entity-sub">{r.planName}</div></div> : <span className="subtle">Private</span>) },
    { key: 'lastVisitAt', header: 'Last visit', sortable: true, render: (r) => <span className="nowrap">{formatDate(r.lastVisitAt)}</span> },
    col.status(),
  ],
  filters: [
    statusFilter(),
    { key: 'branchIds', label: 'Branches', options: { resource: 'branches' } },
    { key: 'medicalAidId', label: 'Medical aids', options: { resource: 'medicalAids' } },
  ],
};

export function PatientsListPage() {
  const [params] = useSearchParams();
  const [importing, setImporting] = useState(false);
  const search = params.get('search') ?? '';

  return (
    <>
      <ResourceListPage
        key={search}
        initialSearch={search}
        config={{
          ...patientsConfig,
          headerActions: (
            <Button icon={FilePlus2} onClick={() => setImporting(true)}>
              Import lead data
            </Button>
          ),
        }}
      />
      <ImportLeadModal open={importing} onClose={() => setImporting(false)} />
    </>
  );
}
