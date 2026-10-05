import { RefreshCcw } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { claimsApi } from '../../api';
import { DocumentsPanel } from '../../components/crm/DocumentsPanel';
import { NotesPanel } from '../../components/crm/NotesPanel';
import { EntityFormModal } from '../../components/resource/EntityFormModal';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  DataTable,
  DetailList,
  PageHeader,
  QueryState,
  StatusBadge,
  Tabs,
  Timeline,
} from '../../components/ui';
import { useToast } from '../../context/ToastContext';
import { useApiQuery } from '../../hooks/useApiQuery';
import { formatCurrency, formatDate } from '../../utils/format';

const STATUS_FIELDS = [
  { name: 'status', label: 'New status', type: 'select', required: true, options: { status: 'claim' }, span: 12 },
  { name: 'approvedAmount', label: 'Approved amount', type: 'currency', min: 0, visibleWhen: (v) => ['approved', 'paid'].includes(v.status), span: 12 },
  { name: 'comment', label: 'Comment', type: 'textarea', rows: 3, span: 12, required: true, visibleWhen: (v) => ['rejected', 'requires_information'].includes(v.status) },
];

export function ClaimDetailPage() {
  const { id } = useParams();
  const toast = useToast();
  const { data: c, loading, error, refetch } = useApiQuery(() => claimsApi.get(id), [id]);
  const [tab, setTab] = useState('timeline');
  const [updating, setUpdating] = useState(false);

  return (
    <QueryState loading={loading} error={error} onRetry={refetch} resource="claim">
      {c && (
        <div className="stack" style={{ gap: 24 }}>
          <PageHeader
            eyebrow="Medical claim"
            title={c.number}
            description={`${c.medicalAidName}${c.planName ? ` · ${c.planName}` : ''}`}
            actions={
              <Button variant="primary" icon={RefreshCcw} onClick={() => setUpdating(true)}>
                Update status
              </Button>
            }
          >
            <div style={{ marginTop: 10 }}>
              <StatusBadge domain="claim" value={c.status} />
            </div>
          </PageHeader>

          <div className="grid grid-main-aside" style={{ alignItems: 'start' }}>
            <div className="stack">
              <Card>
                <CardBody>
                  <DetailList
                    columns={3}
                    items={[
                      { label: 'Patient', value: <Link to={`/patients/${c.patientId}`}>{c.patientName}</Link> },
                      { label: 'Membership number', value: <span className="mono">{c.membershipNumber}</span> },
                      { label: 'Invoice', value: c.invoiceId && <Link to={`/invoices/${c.invoiceId}`}>{c.invoiceNumber}</Link> },
                      { label: 'Medical aid', value: c.medicalAidName },
                      { label: 'Plan', value: c.planName },
                      { label: 'Practice', value: c.practiceName },
                      { label: 'Claim date', value: formatDate(c.date) },
                      { label: 'Claimed', value: formatCurrency(c.amount) },
                      { label: 'Approved', value: c.approvedAmount !== null && c.approvedAmount !== undefined ? formatCurrency(c.approvedAmount) : null },
                    ]}
                  />
                </CardBody>
              </Card>
              <div className="grid grid-2">
                <Card flush>
                  <CardHeader title="ICD-10 codes" />
                  <DataTable
                    compact
                    resource="ICD codes"
                    rows={c.icdCodes ?? []}
                    getRowId={(r) => r.code}
                    columns={[
                      { key: 'code', header: 'Code', render: (r) => <span className="mono strong">{r.code}</span> },
                      { key: 'description', header: 'Description' },
                    ]}
                  />
                </Card>
                <Card flush>
                  <CardHeader title="Procedure codes" />
                  <DataTable
                    compact
                    resource="procedure codes"
                    rows={c.procedureCodes ?? []}
                    getRowId={(r) => r.code}
                    columns={[
                      { key: 'code', header: 'Code', render: (r) => <span className="mono strong">{r.code}</span> },
                      { key: 'description', header: 'Description' },
                      { key: 'quantity', header: 'Qty', align: 'right' },
                      { key: 'amount', header: 'Amount', align: 'right', render: (r) => formatCurrency(r.amount) },
                    ]}
                  />
                </Card>
              </div>
              <Card>
                <div style={{ padding: '8px 20px 0' }}>
                  <Tabs
                    value={tab}
                    onChange={setTab}
                    tabs={[
                      { key: 'timeline', label: 'Timeline' },
                      { key: 'documents', label: 'Documents' },
                      { key: 'notes', label: 'Notes' },
                    ]}
                  />
                </div>
                <CardBody>
                  {tab === 'timeline' && (
                    <QueryState isEmpty={!c.timeline?.length} resource="timeline events" compact>
                      <Timeline items={c.timeline ?? []} />
                    </QueryState>
                  )}
                  {tab === 'documents' && <DocumentsPanel owner={{ claimId: c.id }} />}
                  {tab === 'notes' && <NotesPanel owner={{ claimId: c.id }} />}
                </CardBody>
              </Card>
            </div>
            <Card>
              <CardHeader title="Claim progress" />
              <CardBody>
                <ol className="list-plain stack-sm">
                  {['draft', 'submitted', 'processing', 'approved', 'paid'].map((s) => (
                    <li key={s} className="row-between">
                      <StatusBadge domain="claim" value={s} dot={s === c.status} />
                      {s === c.status && <span className="text-sm strong">Current</span>}
                    </li>
                  ))}
                </ol>
                {['rejected', 'requires_information'].includes(c.status) && (
                  <div style={{ marginTop: 12 }}>
                    <StatusBadge domain="claim" value={c.status} />
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          <EntityFormModal
            open={updating}
            onClose={() => setUpdating(false)}
            size="md"
            title="Update claim status"
            fields={STATUS_FIELDS}
            initialValues={{ status: c.status, approvedAmount: c.approvedAmount ?? '' }}
            submitLabel="Update status"
            onSubmit={async (values) => {
              await claimsApi.updateStatus(c.id, values);
              toast.success('Claim status updated');
              setUpdating(false);
              refetch();
            }}
          />
        </div>
      )}
    </QueryState>
  );
}
