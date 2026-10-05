import { col, statusField, statusFilter } from '../../components/resource/columns';
import { Badge, StatusBadge } from '../../components/ui';
import { formatDateTime } from '../../utils/format';

export const usersConfig = {
  resource: 'users',
  title: 'Users',
  singular: 'User',
  eyebrow: 'Users & access',
  description: 'Staff accounts, their role, the branches they can work in and their default branch and warehouse. Access rules are enforced by the backend.',
  permissions: { create: 'users.create', edit: 'users.edit', delete: 'users.delete' },
  columns: [
    col.entity('fullName', 'User', 'email'),
    { key: 'roleName', header: 'Role', sortable: true, render: (r) => <Badge tone={r.isAdmin || r.roleName === 'Administrator' ? 'brand' : 'neutral'}>{r.roleName}</Badge> },
    col.text('branchNames', 'Branches'),
    { key: 'defaultBranchName', header: 'Defaults', render: (r) => <div>{r.defaultBranchName ?? '—'}<div className="entity-sub">{r.defaultWarehouseName ?? 'No default warehouse'}</div></div> },
    col.dateTime('lastLoginAt', 'Last sign-in'),
    col.status(),
  ],
  filters: [
    { key: 'roleId', label: 'Roles', options: { resource: 'roles' } },
    { key: 'branchIds', label: 'Branches', options: { resource: 'branches' } },
    statusFilter(),
  ],
  fields: [
    { name: 'h-account', type: 'heading', label: 'Account' },
    { name: 'fullName', label: 'Full name', required: true },
    { name: 'email', label: 'Email (sign-in)', type: 'email', required: true },
    { name: 'phone', label: 'Mobile', type: 'tel' },
    statusField(),
    { name: 'h-access', type: 'heading', label: 'Access', hint: 'What the user can do is defined by their role.' },
    { name: 'roleId', label: 'Role', type: 'select', required: true, options: { resource: 'roles' }, span: 12 },
    { name: 'branchIds', label: 'Branch assignment', type: 'multiselect', required: true, options: { resource: 'branches', params: { status: 'active' } }, span: 12 },
    { name: 'defaultBranchId', label: 'Default branch', type: 'select', options: { resource: 'branches', params: { status: 'active' } }, validate: (v, values) => (v && !(values.branchIds ?? []).includes(v) ? 'Default branch must be one of the assigned branches.' : null) },
    { name: 'defaultWarehouseId', label: 'Default warehouse', type: 'select', options: { resource: 'warehouses', dependsOn: 'defaultBranchId', param: 'branchId' }, dependsOnMessage: 'Select a default branch first' },
  ],
  defaultValues: { branchIds: [] },
  toPayload: (v) => ({
    fullName: v.fullName,
    email: v.email,
    phone: v.phone || null,
    roleId: v.roleId,
    branchIds: v.branchIds ?? [],
    defaultBranchId: v.defaultBranchId || null,
    defaultWarehouseId: v.defaultWarehouseId || null,
    status: v.status,
  }),
  viewItems: (r) => [
    { label: 'Email', value: r.email },
    { label: 'Mobile', value: r.phone },
    { label: 'Role', value: r.roleName },
    { label: 'Branches', value: r.branchNames },
    { label: 'Default branch', value: r.defaultBranchName },
    { label: 'Default warehouse', value: r.defaultWarehouseName },
    { label: 'Last sign-in', value: formatDateTime(r.lastLoginAt) },
    { label: 'Status', value: <StatusBadge value={r.status} /> },
  ],
};
