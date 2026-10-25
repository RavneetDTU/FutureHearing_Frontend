import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { communicationsApi } from '../../api';
import { CommunicationsPanel } from '../../components/crm/CommunicationsPanel';
import { Alert, Button, Card, CardBody, EmptyState, PageHeader, QueryState, SearchBar } from '../../components/ui';
import { useToast } from '../../context/ToastContext';
import { useListQuery } from '../../hooks/useListQuery';
import { formatDateTime } from '../../utils/format';

function conversationKey(message) {
  if (message.patientId) return `patient:${message.patientId}`;
  if (message.leadId) return `lead:${message.leadId}`;
  return `contact:${message.to || message.from || message.id}`;
}

function conversationTitle(message) {
  return message.patientName || message.leadName || message.to || message.from || 'Unknown contact';
}

function groupConversations(items) {
  const groups = new Map();
  for (const message of items) {
    const key = conversationKey(message);
    const current = groups.get(key);
    if (!current) {
      groups.set(key, { key, latest: message, messages: [message] });
    } else {
      current.messages.push(message);
      if (String(message.occurredAt) > String(current.latest.occurredAt)) current.latest = message;
    }
  }
  return [...groups.values()].sort((a, b) => String(b.latest.occurredAt).localeCompare(String(a.latest.occurredAt)));
}

export function CommunicationsInboxPage() {
  const toast = useToast();
  const list = useListQuery(communicationsApi.list, {
    baseParams: { channel: 'whatsapp' },
    pageSize: 50,
    sortBy: 'occurredAt',
    sortDir: 'desc',
  });
  const { refetch } = list;
  const conversations = useMemo(() => groupConversations(list.items), [list.items]);
  const [selectedKey, setSelectedKey] = useState(null);
  const [notify, setNotify] = useState(false);
  const seenInbound = useRef(null);
  const selected = conversations.find((c) => c.key === selectedKey) ?? conversations[0];

  useEffect(() => {
    const timer = setInterval(() => refetch(), 60_000);
    return () => clearInterval(timer);
  }, [refetch]);

  useEffect(() => {
    const inbound = list.items.filter((m) => m.direction === 'inbound').map((m) => m.id);
    if (seenInbound.current === null) {
      seenInbound.current = new Set(inbound);
      return;
    }
    const fresh = inbound.filter((id) => !seenInbound.current.has(id));
    inbound.forEach((id) => seenInbound.current.add(id));
    if (notify && fresh.length && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification('New WhatsApp message', { body: 'Open Communications to read it.' });
    }
  }, [list.items, notify]);

  const enableNotifications = async () => {
    if (typeof Notification === 'undefined') {
      toast.error('This browser does not support desktop notifications');
      return;
    }
    const permission = await Notification.requestPermission();
    setNotify(permission === 'granted');
    if (permission !== 'granted') toast.error('Notifications stay off until the browser allows them');
  };

  const owner = selected?.latest?.patientId
    ? { patientId: selected.latest.patientId }
    : selected?.latest?.leadId
      ? { leadId: selected.latest.leadId }
      : null;

  return (
    <div className="stack" style={{ gap: 16 }}>
      <PageHeader
        eyebrow="Relationships"
        title="Communications"
        description="WhatsApp history returned by the server for this session."
        actions={
          <Button onClick={enableNotifications} disabled={notify}>
            {notify ? 'Notifications on' : 'Notify me of new messages'}
          </Button>
        }
      />
      <Alert tone="info">
        Logging a message stores it on the communication record. This API does not send WhatsApp, delivery status, or templates.
        Branch staff only see the conversations the server returns.
      </Alert>
      <div className="grid grid-main-aside">
        <Card flush>
          <div style={{ padding: 12 }}>
            <SearchBar value={list.search} onChange={list.setSearch} placeholder="Search patient, number or message…" />
          </div>
          <QueryState loading={list.loading} error={list.error} onRetry={list.refetch} resource="conversations" isEmpty={!conversations.length}>
            <ul className="list-plain">
              {conversations.map((conversation) => {
                const latest = conversation.latest;
                const unread = latest.direction === 'inbound' && latest.status === 'received';
                return (
                  <li key={conversation.key}>
                    <button
                      type="button"
                      className="list-row"
                      onClick={() => setSelectedKey(conversation.key)}
                      style={{ width: '100%', textAlign: 'left', background: selected?.key === conversation.key ? 'var(--gray-100)' : 'transparent', border: 0 }}
                    >
                      <div className="row-between">
                        <strong>{conversationTitle(latest)}</strong>
                        {unread && <span className="sidebar-soon">New</span>}
                      </div>
                      <div className="entity-sub truncate">{latest.summary}</div>
                      <div className="entity-sub">{formatDateTime(latest.occurredAt)} · {latest.from} → {latest.to}</div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </QueryState>
        </Card>
        <Card>
          <CardBody>
            {!selected ? (
              <EmptyState title="No conversation selected" message="Messages appear here when the server returns WhatsApp history." />
            ) : (
              <div className="stack">
                <div className="row-between">
                  <div>
                    <div className="strong">{conversationTitle(selected.latest)}</div>
                    <div className="entity-sub">{selected.latest.from} · {selected.latest.to}</div>
                  </div>
                  {selected.latest.patientId && <Link to={`/patients/${selected.latest.patientId}`}>Open patient</Link>}
                  {!selected.latest.patientId && selected.latest.leadId && <Link to={`/leads/${selected.latest.leadId}`}>Open lead</Link>}
                </div>
                {owner ? (
                  <CommunicationsPanel owner={owner} contact={{ phone: selected.latest.to || selected.latest.from }} />
                ) : (
                  <Alert tone="warning" title="This number is not linked to a patient or lead">
                    The server did not attach this message to a patient. It is not created automatically.
                  </Alert>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
