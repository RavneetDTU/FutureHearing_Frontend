import {
  Activity,
  CalendarDays,
  CircleDollarSign,
  FileText,
  FolderOpen,
  HeartPulse,
  LayoutGrid,
  Mail,
  MessagesSquare,
  Pencil,
  Phone,
  Plus,
  Receipt,
  RotateCcw,
  ShoppingCart,
  StickyNote,
} from 'lucide-react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { activitiesApi, appointmentsApi, patientsApi } from '../../api';
import { ActivityPanel } from '../../components/crm/ActivityPanel';
import { AppointmentsPanel } from '../../components/crm/AppointmentsPanel';
import { CommunicationsPanel } from '../../components/crm/CommunicationsPanel';
import { DocumentsPanel } from '../../components/crm/DocumentsPanel';
import { NotesPanel } from '../../components/crm/NotesPanel';
import { RelatedTable } from '../../components/crm/RelatedTable';
import { col } from '../../components/resource/columns';
import {
  ActivityFeed,
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  DetailList,
  EmptyState,
  QueryState,
  StatusBadge,
  Tabs,
} from '../../components/ui';
import { optionLabel } from '../../config/statuses';
import { useApiQuery } from '../../hooks/useApiQuery';
import { formatDate } from '../../utils/format';
import { invoicesConfig } from '../sales/InvoicesListPage';
import { paymentsConfig, refundsConfig } from '../sales/resources';
import { purchasesConfig } from '../purchases/PurchasesListPage';

const TABS = [
  { key: 'overview', label: 'Overview', icon: LayoutGrid },
  { key: 'invoices', label: 'Invoices', icon: Receipt },
  { key: 'documents', label: 'Documents', icon: FolderOpen },
  { key: 'notes', label: 'Notes', icon: StickyNote },
  { key: 'purchases', label: 'Purchases', icon: ShoppingCart },
  { key: 'payments', label: 'Payments', icon: CircleDollarSign },
  { key: 'medical-aid', label: 'Medical Aid', icon: HeartPulse },
  { key: 'refunds', label: 'Refunds', icon: RotateCcw },
  { key: 'communications', label: 'Communications', icon: MessagesSquare },
  { key: 'appointments', label: 'Appointments', icon: CalendarDays },
  { key: 'activity', label: 'Activity', icon: Activity },
];

const without = (columns, ...keys) => columns.filter((c) => !keys.includes(c.key));

function Overview({ patient }) {
  const upcoming = useApiQuery(() => appointmentsApi.list({ patientId: patient.id, when: 'upcoming', pageSize: 3 }), [patient.id]);
  const activity = useApiQuery(() => activitiesApi.list({ patientId: patient.id, pageSize: 6, sortBy: 'occurredAt', sortDir: 'desc' }), [patient.id]);
  return (
    <div className="grid grid-main-aside">
      <div className="stack">
        <Card>
          <CardHeader title="Patient details" />
          <CardBody>
            <DetailList
              columns={3}
              items={[
                { label: 'Patient number', value: patient.patientNumber },
                { label: 'ID number', value: patient.idNumber },
                { label: 'Date of birth', value: formatDate(patient.dateOfBirth) },
                { label: 'Gender', value: optionLabel('gender', patient.gender) },
                { label: 'Mobile', value: patient.mobile },
                { label: 'Email', value: patient.email },
                { label: 'Address', value: patient.address, span: true },
                { label: 'Referred by', value: patient.referredBy },
                { label: 'Patient since', value: formatDate(patient.createdAt) },
                { label: 'Last visit', value: formatDate(patient.lastVisitAt) },
              ]}
            />
          </CardBody>
        </Card>
        <Card flush>
          <CardHeader title="Recent activity" />
          <QueryState loading={activity.loading} error={activity.error} onRetry={activity.refetch} resource="activity" compact isEmpty={!activity.data?.items?.length}>
            <ActivityFeed items={activity.data?.items} />
          </QueryState>
        </Card>
      </div>
      <div className="stack">
        <Card>
          <CardHeader title="Medical aid" />
          <CardBody>
            {patient.medicalAidId ? (
              <DetailList
                columns={1}
                items={[
                  { label: 'Scheme', value: patient.medicalAidName },
                  { label: 'Plan', value: patient.planName },
                  { label: 'Membership number', value: <span className="mono">{patient.membershipNumber}</span> },
                  { label: 'Dependant code', value: patient.dependantCode },
                ]}
              />
            ) : (
              <EmptyState compact title="Private patient" message="No medical aid on file." />
            )}
          </CardBody>
        </Card>
        <Card flush>
          <CardHeader title="Upcoming appointments" />
          <QueryState loading={upcoming.loading} error={upcoming.error} onRetry={upcoming.refetch} resource="appointments" compact isEmpty={!upcoming.data?.items?.length}>
            <ul className="list-plain">
              {upcoming.data?.items?.map((a) => (
                <li key={a.id} className="list-row">
                  <div>
                    <div className="entity-title">{optionLabel('appointmentType', a.type)}</div>
                    <div className="entity-sub">
                      {formatDate(a.date)} · {a.time} · {a.branchName}
                    </div>
                  </div>
                  <StatusBadge domain="appointment" value={a.status} />
                </li>
              ))}
            </ul>
          </QueryState>
        </Card>
      </div>
    </div>
  );
}

function MedicalAidTab({ patient }) {
  return (
    <div className="stack">
      <Card>
        <CardHeader title="Membership" actions={<Button size="sm" icon={Pencil} to={`/patients/${patient.id}/edit`}>Edit</Button>} />
        <CardBody>
          {patient.medicalAidId ? (
            <DetailList
              columns={3}
              items={[
                { label: 'Medical aid', value: <Link to={`/medical-aids/${patient.medicalAidId}`}>{patient.medicalAidName}</Link> },
                { label: 'Plan', value: patient.planName },
                { label: 'Membership number', value: patient.membershipNumber },
                { label: 'Dependant code', value: patient.dependantCode },
                { label: 'Main member', value: patient.mainMember },
              ]}
            />
          ) : (
            <EmptyState compact title="No medical aid" message="Add medical aid details to submit claims." />
          )}
        </CardBody>
      </Card>
      <Card flush>
        <CardHeader title="Medical claims" actions={<Button size="sm" icon={Plus} to={`/claims?patientId=${patient.id}`}>New claim</Button>} />
        <RelatedTable
          resource="claims"
          label="claims"
          params={{ patientId: patient.id }}
          columns={[
            col.link('number', 'Claim', (r) => `/claims/${r.id}`),
            col.text('medicalAidName', 'Medical aid'),
            col.text('invoiceNumber', 'Invoice'),
            col.date('date', 'Date'),
            col.currency('amount', 'Amount'),
            col.status('claim'),
          ]}
        />
      </Card>
    </div>
  );
}

export function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') ?? 'overview';
  const { data: p, loading, error, refetch } = useApiQuery(() => patientsApi.get(id), [id]);
  const owner = { patientId: id };

  const setTab = (key) => setParams(key === 'overview' ? {} : { tab: key }, { replace: true });

  return (
    <QueryState loading={loading} error={error} onRetry={refetch} resource="patient">
      {p && (
        <div className="stack" style={{ gap: 20 }}>
          <Card>
            <CardBody>
              <div className="row-between" style={{ alignItems: 'flex-start' }}>
                <div className="entity" style={{ gap: 16 }}>
                  <Avatar name={p.fullName} size="lg" />
                  <div>
                    <div className="page-eyebrow" style={{ marginBottom: 2 }}>
                      Patient · {p.patientNumber}
                    </div>
                    <h1 className="page-title">
                      {p.title && `${p.title} `}
                      {p.fullName}
                    </h1>
                    <div className="row" style={{ marginTop: 8 }}>
                      <StatusBadge value={p.status} />
                      {p.medicalAidName ? <Badge tone="brand">{p.medicalAidName}</Badge> : <Badge>Private</Badge>}
                      {(p.branchNames ?? '').split(', ').filter(Boolean).map((b) => (
                        <Badge key={b} tone="info">
                          {b}
                        </Badge>
                      ))}
                    </div>
                    <div className="row text-sm muted" style={{ marginTop: 8, gap: 16 }}>
                      {p.mobile && (
                        <span className="row" style={{ gap: 6 }}>
                          <Phone size={14} /> {p.mobile}
                        </span>
                      )}
                      {p.email && (
                        <span className="row" style={{ gap: 6 }}>
                          <Mail size={14} /> {p.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="page-actions">
                  <Button icon={Pencil} to={`/patients/${p.id}/edit`}>
                    Edit
                  </Button>
                  <Button icon={CalendarDays} onClick={() => setTab('appointments')}>
                    Book appointment
                  </Button>
                  <Button variant="primary" icon={FileText} to={`/invoices/new?patientId=${p.id}&patientName=${encodeURIComponent(p.fullName)}`}>
                    New invoice
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          <Tabs tabs={TABS} value={tab} onChange={setTab} />

          {tab === 'overview' && <Overview patient={p} />}
          {tab === 'invoices' && (
            <Card flush>
              <RelatedTable
                resource="invoices"
                label="invoices"
                params={owner}
                columns={without(invoicesConfig.columns, 'patientName')}
                onRowClick={(r) => navigate(`/invoices/${r.id}`)}
              />
            </Card>
          )}
          {tab === 'documents' && <DocumentsPanel owner={owner} />}
          {tab === 'notes' && (
            <Card>
              <CardBody>
                <NotesPanel owner={owner} />
              </CardBody>
            </Card>
          )}
          {tab === 'purchases' && (
            <Card flush>
              <CardHeader title="Purchases allocated to this patient" />
              <RelatedTable
                resource="purchases"
                label="purchases"
                params={owner}
                columns={without(purchasesConfig.columns, 'patientName')}
                onRowClick={(r) => navigate(`/purchases/${r.id}`)}
              />
            </Card>
          )}
          {tab === 'payments' && (
            <Card flush>
              <RelatedTable resource="payments" label="payments" params={owner} columns={without(paymentsConfig.columns, 'patientName')} />
            </Card>
          )}
          {tab === 'medical-aid' && <MedicalAidTab patient={p} />}
          {tab === 'refunds' && (
            <Card flush>
              <RelatedTable resource="refunds" label="refunds" params={owner} columns={without(refundsConfig.columns, 'patientName')} />
            </Card>
          )}
          {tab === 'communications' && <CommunicationsPanel owner={owner} contact={{ phone: p.mobile, email: p.email }} />}
          {tab === 'appointments' && <AppointmentsPanel owner={owner} defaults={{ branchId: p.branchIds?.[0] }} />}
          {tab === 'activity' && (
            <Card>
              <CardBody>
                <ActivityPanel owner={owner} />
              </CardBody>
            </Card>
          )}
        </div>
      )}
    </QueryState>
  );
}
