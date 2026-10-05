import { Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { activitiesApi, branchesApi, practicesApi, stockApi, usersApi, warehousesApi } from '../../api';
import { EntityFormModal } from '../../components/resource/EntityFormModal';
import {
  ActivityFeed,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  DataTable,
  DetailList,
  EmptyState,
  EntityCell,
  PageHeader,
  QueryState,
  StatCard,
  StatusBadge,
} from '../../components/ui';
import { optionLabel } from '../../config/statuses';
import { useToast } from '../../context/ToastContext';
import { useApiQuery } from '../../hooks/useApiQuery';
import { formatNumber } from '../../utils/format';
import { branchesConfig, warehousesConfig } from '../inventory/resources';

export function BranchDetailPage() {
  const { id } = useParams();
  const toast = useToast();
  const branch = useApiQuery(() => branchesApi.get(id), [id]);
  const warehouses = useApiQuery(() => warehousesApi.list({ branchId: id, pageSize: 50 }), [id]);
  const users = useApiQuery(() => usersApi.list({ branchIds: id, pageSize: 50 }), [id]);
  const stock = useApiQuery(() => stockApi.summary({ branchId: id }), [id]);
  const activity = useApiQuery(() => activitiesApi.list({ branchId: id, pageSize: 8 }), [id]);
  const practiceId = branch.data?.practiceId;
  const practice = useApiQuery(() => practicesApi.get(practiceId), [practiceId], { enabled: Boolean(practiceId) });
  const [editing, setEditing] = useState(false);
  const [addingWarehouse, setAddingWarehouse] = useState(false);

  const b = branch.data;
  const totals = stock.data?.totals ?? {};

  return (
    <QueryState loading={branch.loading} error={branch.error} onRetry={branch.refetch} resource="branch">
      {b && (
        <div className="stack" style={{ gap: 24 }}>
          <PageHeader
            eyebrow={`Branch · ${b.code}`}
            title={b.name}
            description={[b.address, b.city].filter(Boolean).join(', ')}
            actions={
              <Button variant="primary" icon={Pencil} onClick={() => setEditing(true)}>
                Edit branch
              </Button>
            }
          >
            <div style={{ marginTop: 10 }}>
              <StatusBadge value={b.status} />
            </div>
          </PageHeader>

          <div className="grid grid-4">
            <StatCard label="Units in stock" value={formatNumber(totals.totalUnits)} loading={stock.loading} to="/stock" />
            <StatCard label="Low stock" value={formatNumber(totals.lowStock)} tone="warning" loading={stock.loading} to="/stock" />
            <StatCard label="Out of stock" value={formatNumber(totals.outOfStock)} tone="danger" loading={stock.loading} to="/stock" />
            <StatCard label="Warehouses" value={formatNumber(warehouses.data?.total)} loading={warehouses.loading} />
          </div>

          <div className="grid grid-main-aside">
            <div className="stack">
              <Card>
                <CardHeader title="Branch information" />
                <CardBody>
                  <DetailList
                    items={[
                      { label: 'Branch code', value: b.code },
                      { label: 'Store manager', value: b.managerName },
                      { label: 'Telephone', value: b.phone },
                      { label: 'Email', value: b.email },
                      { label: 'Address', value: [b.address, b.city].filter(Boolean).join(', '), span: true },
                    ]}
                  />
                </CardBody>
              </Card>

              <Card flush>
                <CardHeader
                  title="Warehouses"
                  subtitle="A branch can hold stock in multiple warehouses"
                  actions={<Button size="sm" icon={Plus} onClick={() => setAddingWarehouse(true)}>Add warehouse</Button>}
                />
                <DataTable
                  compact
                  resource="warehouses"
                  loading={warehouses.loading}
                  error={warehouses.error}
                  onRetry={warehouses.refetch}
                  rows={warehouses.data?.items ?? []}
                  emptyMessage="Every branch needs at least one warehouse to hold stock."
                  columns={[
                    { key: 'name', header: 'Warehouse', render: (w) => <span className="row"><strong>{w.name}</strong>{w.isDefault && <Badge tone="brand">Default</Badge>}</span> },
                    { key: 'type', header: 'Type', render: (w) => optionLabel('warehouseType', w.type) },
                    { key: 'description', header: 'Description' },
                    { key: 'status', header: 'Status', render: (w) => <StatusBadge value={w.status} /> },
                  ]}
                />
              </Card>

              <Card flush>
                <CardHeader title="Assigned users" actions={<Link to="/users" className="text-sm">Manage users</Link>} />
                <DataTable
                  compact
                  resource="users"
                  loading={users.loading}
                  error={users.error}
                  onRetry={users.refetch}
                  rows={users.data?.items ?? []}
                  columns={[
                    { key: 'fullName', header: 'User', render: (u) => <EntityCell name={u.fullName} subtitle={u.email} size="sm" /> },
                    { key: 'roleName', header: 'Role' },
                    { key: 'defaultBranchName', header: 'Default branch', render: (u) => (u.defaultBranchId === id ? <Badge tone="success">This branch</Badge> : u.defaultBranchName ?? '—') },
                    { key: 'defaultWarehouseName', header: 'Default warehouse' },
                    { key: 'status', header: 'Status', render: (u) => <StatusBadge value={u.status} /> },
                  ]}
                />
              </Card>
            </div>

            <div className="stack">
              <Card>
                <CardHeader title="Practice information" actions={<Link to="/practices" className="text-sm">Practices</Link>} />
                <CardBody>
                  {!practiceId ? (
                    <EmptyState compact title="No practice linked" message="Link a practice to show its details on invoices and claims." />
                  ) : (
                    <QueryState loading={practice.loading} error={practice.error} onRetry={practice.refetch} resource="practice" compact>
                      {practice.data && (
                        <DetailList
                          columns={1}
                          items={[
                            { label: 'Practice', value: practice.data.name },
                            { label: 'Practice number', value: practice.data.practiceNumber },
                            { label: 'Practitioner', value: practice.data.practitionerName },
                            { label: 'HPCSA', value: practice.data.hpcsaNumber },
                            { label: 'Claims email', value: practice.data.email },
                          ]}
                        />
                      )}
                    </QueryState>
                  )}
                </CardBody>
              </Card>
              <Card flush>
                <CardHeader title="Recent activity" />
                <QueryState loading={activity.loading} error={activity.error} onRetry={activity.refetch} resource="activity" compact isEmpty={!activity.data?.items?.length}>
                  <ActivityFeed items={activity.data?.items} />
                </QueryState>
              </Card>
            </div>
          </div>

          <EntityFormModal
            open={editing}
            onClose={() => setEditing(false)}
            title="Edit branch"
            fields={branchesConfig.fields}
            initialValues={b}
            submitLabel="Save changes"
            onSubmit={async (values) => {
              await branchesApi.update(b.id, values);
              toast.success('Branch updated');
              setEditing(false);
              branch.refetch();
            }}
          />
          <EntityFormModal
            open={addingWarehouse}
            onClose={() => setAddingWarehouse(false)}
            size="md"
            title={`Add warehouse to ${b.name}`}
            fields={warehousesConfig.fields}
            initialValues={{ branchId: b.id, type: 'other', status: 'active', isDefault: false }}
            submitLabel="Create warehouse"
            onSubmit={async (values) => {
              await warehousesApi.create(values);
              toast.success('Warehouse created');
              setAddingWarehouse(false);
              warehouses.refetch();
            }}
          />
        </div>
      )}
    </QueryState>
  );
}
