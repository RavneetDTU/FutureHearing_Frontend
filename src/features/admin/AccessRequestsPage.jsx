import { useState } from 'react';
import { accessRequestsApi } from '../../api';
import { Button, Card, DataTable, FilterBar, PageHeader, Pagination, StatusBadge } from '../../components/ui';
import { useToast } from '../../context/ToastContext';
import { useListQuery } from '../../hooks/useListQuery';
import { formatDateTime } from '../../utils/format';

function pick(row, ...keys) {
  for (const key of keys) {
    const value = row?.[key];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return null;
}

const COLUMNS = [
  {
    key: 'requestedAt',
    header: 'Date requested',
    sortable: true,
    render: (r) => <span className="nowrap">{formatDateTime(pick(r, 'requestedAt', 'createdAt'))}</span>,
  },
  {
    key: 'userName',
    header: 'User name',
    sortable: true,
    render: (r) => (
      <div>
        <div className="strong">{pick(r, 'userName', 'fullName') || '—'}</div>
        {pick(r, 'email') && <div className="entity-sub">{r.email}</div>}
      </div>
    ),
  },
  {
    key: 'ipAddress',
    header: 'IP address',
    sortable: true,
    render: (r) => <span className="mono">{pick(r, 'ipAddress', 'ip', 'clientIp') || '—'}</span>,
  },
  {
    key: 'operatingSystem',
    header: 'Operating system',
    render: (r) => pick(r, 'operatingSystem', 'os') || '—',
  },
  {
    key: 'browser',
    header: 'Browser',
    render: (r) => pick(r, 'browser', 'browserName') || '—',
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (r) => <StatusBadge domain="accessRequest" value={r.status} />,
  },
  {
    key: 'warehouseName',
    header: 'Warehouse',
    render: (r) => pick(r, 'warehouseName', 'warehouse', 'defaultWarehouseName', 'branchName') || '—',
  },
];

export function AccessRequestsPage() {
  const toast = useToast();
  const list = useListQuery(accessRequestsApi.list, {
    sortBy: 'requestedAt',
    sortDir: 'desc',
  });
  const [busyId, setBusyId] = useState(null);

  const decide = async (row, value) => {
    setBusyId(row.id);
    try {
      await accessRequestsApi.decide(row.id, { decision: value });
      toast.success(value === 'approved' ? 'Sign-in approved' : 'Sign-in rejected', pick(row, 'userName', 'fullName', 'email'));
      list.refetch();
    } catch (err) {
      toast.error('Unable to update request', err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Access requests"
        title="List access requests"
        description="When a store manager signs in from an IP that is not yet approved, the request appears here. Approving allows that person to sign in from that IP only."
      />
      <Card flush>
        <FilterBar
          list={list}
          searchPlaceholder="Search name or email…"
          filters={[{ key: 'status', label: 'Approval statuses', options: { status: 'accessRequest' } }]}
        />
        <DataTable
          resource="access requests"
          columns={[
            ...COLUMNS,
            {
              key: 'decision',
              header: 'Approve / Reject',
              render: (row) =>
                row.status === 'pending' ? (
                  <div className="row" style={{ gap: 8 }}>
                    <Button size="sm" variant="primary" loading={busyId === row.id} disabled={Boolean(busyId)} onClick={() => decide(row, 'approved')}>
                      Approve
                    </Button>
                    <Button size="sm" variant="danger" disabled={Boolean(busyId)} onClick={() => decide(row, 'rejected')}>
                      Reject
                    </Button>
                  </div>
                ) : (
                  <div>
                    <StatusBadge domain="accessRequest" value={row.status} />
                    {pick(row, 'decidedBy', 'decidedByName') && (
                      <div className="entity-sub">{pick(row, 'decidedBy', 'decidedByName')}</div>
                    )}
                  </div>
                ),
            },
          ]}
          rows={list.items}
          loading={list.loading}
          error={list.error}
          onRetry={list.refetch}
          sort={list.sort}
          onSort={list.toggleSort}
          emptyTitle="No access requests"
          emptyMessage="New sign-ins from an unapproved IP will appear here for an administrator to approve or reject."
        />
        {!list.error && (
          <Pagination page={list.page} pageSize={list.pageSize} total={list.total} onPageChange={list.setPage} onPageSizeChange={list.setPageSize} />
        )}
      </Card>
    </>
  );
}
