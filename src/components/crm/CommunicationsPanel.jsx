import { ArrowDownLeft, ArrowUpRight, Mail, MessageCircle, Phone, Plus } from 'lucide-react';
import { useState } from 'react';
import { communicationsApi } from '../../api';
import { useToast } from '../../context/ToastContext';
import { useListQuery } from '../../hooks/useListQuery';
import { formatDateTime, formatDuration } from '../../utils/format';
import { EntityFormModal } from '../resource/EntityFormModal';
import { Alert, Button, Card, DataTable, Pagination, QueryState, StatusBadge, Tabs } from '../ui';

const CHANNELS = [
  { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { key: 'call', label: 'Phone calls', icon: Phone },
  { key: 'email', label: 'Emails', icon: Mail },
];

const STATUS_OPTIONS = {
  whatsapp: ['sent', 'delivered', 'read', 'received', 'failed'],
  call: ['answered', 'missed', 'logged'],
  email: ['sent', 'delivered', 'received', 'failed'],
};

function manualFields(channel) {
  const base = [
    { name: 'direction', label: 'Direction', type: 'segmented', required: true, options: 'direction', span: 12 },
    { name: 'occurredAt', label: 'Date & time', type: 'datetime-local', required: true },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: STATUS_OPTIONS[channel].map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) })),
    },
    { name: 'from', label: 'From', required: true },
    { name: 'to', label: 'To', required: true },
  ];
  if (channel === 'email') base.push({ name: 'subject', label: 'Subject', required: true, span: 12 });
  if (channel === 'call') {
    base.push({ name: 'subject', label: 'Call purpose', span: 8 });
    base.push({ name: 'durationSeconds', label: 'Duration (seconds)', type: 'number', min: 0, span: 4 });
  }
  base.push({ name: 'summary', label: channel === 'whatsapp' ? 'Message' : 'Summary', type: 'textarea', required: true, rows: 4, span: 12 });
  return base;
}

function WhatsAppThread({ items }) {
  const ordered = [...items].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  return (
    <div className="chat">
      {ordered.map((m) => (
        <div key={m.id} className={`bubble ${m.direction}`}>
          <div style={{ whiteSpace: 'pre-wrap' }}>{m.summary}</div>
          <div className="bubble-meta">
            {m.staffName && `${m.staffName} · `}
            {formatDateTime(m.occurredAt)} · {m.status}
          </div>
        </div>
      ))}
    </div>
  );
}

const DirectionIcon = ({ direction }) =>
  direction === 'inbound' ? (
    <ArrowDownLeft size={16} color="var(--tone-info-fg)" aria-label="Inbound" />
  ) : (
    <ArrowUpRight size={16} color="var(--tone-success-fg)" aria-label="Outbound" />
  );

const callColumns = [
  { key: 'direction', header: '', width: 32, render: (c) => <DirectionIcon direction={c.direction} /> },
  { key: 'occurredAt', header: 'Date / time', render: (c) => <span className="nowrap">{formatDateTime(c.occurredAt)}</span> },
  { key: 'subject', header: 'Call', render: (c) => <div><div className="strong">{c.subject ?? 'Phone call'}</div><div className="entity-sub">{c.summary}</div></div> },
  { key: 'from', header: 'From → To', render: (c) => <span className="text-sm">{c.from} → {c.to}</span> },
  { key: 'durationSeconds', header: 'Duration', render: (c) => formatDuration(c.durationSeconds) },
  { key: 'staffName', header: 'Staff' },
  { key: 'status', header: 'Status', render: (c) => <StatusBadge domain="communication" value={c.status} /> },
];

const emailColumns = [
  { key: 'direction', header: '', width: 32, render: (c) => <DirectionIcon direction={c.direction} /> },
  { key: 'subject', header: 'Email', render: (c) => <div><div className="strong">{c.subject}</div><div className="entity-sub">{c.summary}</div></div> },
  { key: 'from', header: 'From → To', render: (c) => <span className="text-sm">{c.from} → {c.to}</span> },
  { key: 'occurredAt', header: 'Date / time', render: (c) => <span className="nowrap">{formatDateTime(c.occurredAt)}</span> },
  { key: 'status', header: 'Status', render: (c) => <StatusBadge domain="communication" value={c.status} /> },
];

function ChannelView({ owner, channel, contact }) {
  const toast = useToast();
  const list = useListQuery(communicationsApi.list, { baseParams: { ...owner, channel }, sortBy: 'occurredAt', sortDir: 'desc', pageSize: channel === 'whatsapp' ? 50 : 10 });
  const [logging, setLogging] = useState(false);
  const label = CHANNELS.find((c) => c.key === channel).label;

  return (
    <div className="stack">
      <div className="row-between">
        <span className="text-sm muted">
          {channel === 'whatsapp' ? 'Conversation history' : `${label} history`} — integration data is provided by the backend.
        </span>
        <Button size="sm" icon={Plus} onClick={() => setLogging(true)}>
          Log {channel === 'call' ? 'call' : channel === 'email' ? 'email' : 'message'}
        </Button>
      </div>
      {channel === 'whatsapp' ? (
        <QueryState loading={list.loading} error={list.error} onRetry={list.refetch} resource="WhatsApp messages" isEmpty={!list.items.length} compact>
          <WhatsAppThread items={list.items} />
        </QueryState>
      ) : (
        <Card flush>
          <DataTable
            compact
            resource={label.toLowerCase()}
            rows={list.items}
            loading={list.loading}
            error={list.error}
            onRetry={list.refetch}
            columns={channel === 'call' ? callColumns : emailColumns}
          />
          {list.total > list.pageSize && <Pagination page={list.page} pageSize={list.pageSize} total={list.total} onPageChange={list.setPage} />}
        </Card>
      )}
      <EntityFormModal
        open={logging}
        onClose={() => setLogging(false)}
        title={`Log ${label.toLowerCase().replace(/s$/, '')}`}
        description="Manual entries are stored alongside integration data."
        fields={manualFields(channel)}
        initialValues={{
          direction: 'outbound',
          status: STATUS_OPTIONS[channel][0],
          occurredAt: new Date().toISOString().slice(0, 16),
          from: 'Future Hearing',
          to: channel === 'email' ? (contact?.email ?? '') : (contact?.phone ?? ''),
        }}
        submitLabel="Save entry"
        onSubmit={async (values) => {
          await communicationsApi.create({ ...owner, channel, ...values, manual: true });
          toast.success('Communication logged');
          setLogging(false);
          list.refetch();
        }}
      />
    </div>
  );
}

/** owner: { patientId } | { leadId }. contact: { phone, email } for pre-filling manual entries. */
export function CommunicationsPanel({ owner, contact }) {
  const [channel, setChannel] = useState('whatsapp');
  return (
    <div className="stack">
      <Tabs variant="pills" tabs={CHANNELS} value={channel} onChange={setChannel} />
      <Alert tone="info">WhatsApp, phone and email integrations are connected by the backend team. This view displays their history.</Alert>
      <ChannelView key={channel} owner={owner} channel={channel} contact={contact} />
    </div>
  );
}
