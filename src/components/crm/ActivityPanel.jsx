import { activitiesApi } from '../../api';
import { useListQuery } from '../../hooks/useListQuery';
import { Pagination, QueryState, Tabs, Timeline } from '../ui';

const TYPE_FILTERS = [
  { key: '', label: 'All' },
  { key: 'invoice', label: 'Invoices' },
  { key: 'payment', label: 'Payments' },
  { key: 'appointment', label: 'Appointments' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'call', label: 'Calls' },
  { key: 'email', label: 'Emails' },
  { key: 'medical_aid', label: 'Medical aid' },
  { key: 'note', label: 'Notes' },
];

/** System activity timeline supplied by the backend. owner: { patientId } | { leadId } */
export function ActivityPanel({ owner }) {
  const list = useListQuery(activitiesApi.list, { baseParams: owner, filters: { type: '' }, sortBy: 'occurredAt', sortDir: 'desc', pageSize: 10 });
  return (
    <div className="stack">
      <Tabs variant="pills" tabs={TYPE_FILTERS} value={list.filters.type} onChange={(v) => list.setFilter('type', v)} />
      <QueryState loading={list.loading} error={list.error} onRetry={list.refetch} resource="activity" isEmpty={!list.items.length} compact>
        <Timeline items={list.items} />
      </QueryState>
      {!list.error && list.total > list.pageSize && (
        <div className="card">
          <Pagination page={list.page} pageSize={list.pageSize} total={list.total} onPageChange={list.setPage} />
        </div>
      )}
    </div>
  );
}
