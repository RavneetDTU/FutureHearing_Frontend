import { Mail, Pencil, Phone, UserCheck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { leadsApi } from '../../api';
import { ActivityPanel } from '../../components/crm/ActivityPanel';
import { AppointmentsPanel } from '../../components/crm/AppointmentsPanel';
import { CommunicationsPanel } from '../../components/crm/CommunicationsPanel';
import { NotesPanel } from '../../components/crm/NotesPanel';
import { EntityFormModal } from '../../components/resource/EntityFormModal';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  ConfirmDialog,
  DetailList,
  QueryState,
  StatusBadge,
  Tabs,
} from '../../components/ui';
import { optionLabel } from '../../config/statuses';
import { useToast } from '../../context/ToastContext';
import { useApiQuery } from '../../hooks/useApiQuery';
import { formatDateTime } from '../../utils/format';
import { LEAD_FIELDS } from './resources';

const TABS = [
  { key: 'info', label: 'Lead information' },
  { key: 'notes', label: 'Notes' },
  { key: 'appointments', label: 'Appointments' },
  { key: 'communications', label: 'Communications' },
  { key: 'activity', label: 'Activity' },
];

export function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') ?? 'info';
  const { data: lead, loading, error, refetch } = useApiQuery(() => leadsApi.get(id), [id]);
  const [editing, setEditing] = useState(false);
  const [converting, setConverting] = useState(false);
  const [convertLoading, setConvertLoading] = useState(false);
  const owner = { leadId: id };

  const convert = async () => {
    setConvertLoading(true);
    try {
      const res = await leadsApi.convertToPatient(id);
      toast.success('Lead converted to patient');
      navigate(res?.patientId ? `/patients/${res.patientId}` : '/patients');
    } catch (err) {
      toast.error('Unable to convert lead', err.message);
      setConvertLoading(false);
    }
  };

  return (
    <QueryState loading={loading} error={error} onRetry={refetch} resource="lead">
      {lead && (
        <div className="stack" style={{ gap: 20 }}>
          <Card>
            <CardBody>
              <div className="row-between" style={{ alignItems: 'flex-start' }}>
                <div className="entity" style={{ gap: 16 }}>
                  <Avatar name={lead.fullName} size="lg" />
                  <div>
                    <div className="page-eyebrow" style={{ marginBottom: 2 }}>
                      Lead · {optionLabel('leadSource', lead.source)}
                    </div>
                    <h1 className="page-title">{lead.fullName}</h1>
                    <div className="row" style={{ marginTop: 8 }}>
                      <StatusBadge domain="lead" value={lead.status} />
                      {lead.branchName && <Badge tone="info">{lead.branchName}</Badge>}
                      {lead.assignedToName && <Badge>Assigned to {lead.assignedToName}</Badge>}
                    </div>
                    <div className="row text-sm muted" style={{ marginTop: 8, gap: 16 }}>
                      {lead.phone && (
                        <span className="row" style={{ gap: 6 }}>
                          <Phone size={14} /> {lead.phone}
                        </span>
                      )}
                      {lead.email && (
                        <span className="row" style={{ gap: 6 }}>
                          <Mail size={14} /> {lead.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="page-actions">
                  <Button icon={Pencil} onClick={() => setEditing(true)}>
                    Edit
                  </Button>
                  {lead.status !== 'converted' && (
                    <Button variant="primary" icon={UserCheck} onClick={() => setConverting(true)}>
                      Convert to patient
                    </Button>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          <Tabs tabs={TABS} value={tab} onChange={(k) => setParams(k === 'info' ? {} : { tab: k }, { replace: true })} />

          {tab === 'info' && (
            <Card>
              <CardHeader title="Lead information" />
              <CardBody>
                <DetailList
                  columns={3}
                  items={[
                    { label: 'Full name', value: lead.fullName },
                    { label: 'Phone', value: lead.phone },
                    { label: 'Email', value: lead.email },
                    { label: 'Source', value: optionLabel('leadSource', lead.source) },
                    { label: 'Branch', value: lead.branchName },
                    { label: 'Assigned to', value: lead.assignedToName },
                    { label: 'Created', value: formatDateTime(lead.createdAt) },
                    { label: 'Status', value: <StatusBadge domain="lead" value={lead.status} /> },
                    { label: 'Interest / enquiry', value: lead.interest, span: true },
                  ]}
                />
              </CardBody>
            </Card>
          )}
          {tab === 'notes' && (
            <Card>
              <CardBody>
                <NotesPanel owner={owner} />
              </CardBody>
            </Card>
          )}
          {tab === 'appointments' && <AppointmentsPanel owner={owner} defaults={{ branchId: lead.branchId }} />}
          {tab === 'communications' && <CommunicationsPanel owner={owner} contact={{ phone: lead.phone, email: lead.email }} />}
          {tab === 'activity' && (
            <Card>
              <CardBody>
                <ActivityPanel owner={owner} />
              </CardBody>
            </Card>
          )}

          <EntityFormModal
            open={editing}
            onClose={() => setEditing(false)}
            size="md"
            title="Edit lead"
            fields={LEAD_FIELDS}
            initialValues={lead}
            submitLabel="Save changes"
            onSubmit={async (values) => {
              await leadsApi.update(id, values);
              toast.success('Lead updated');
              setEditing(false);
              refetch();
            }}
          />
          <ConfirmDialog
            open={converting}
            onClose={() => setConverting(false)}
            onConfirm={convert}
            loading={convertLoading}
            tone="primary"
            title="Convert lead to patient?"
            message={`A patient record will be created for ${lead.fullName}. Notes, communications and appointments stay linked.`}
            confirmLabel="Convert to patient"
          />
        </div>
      )}
    </QueryState>
  );
}
