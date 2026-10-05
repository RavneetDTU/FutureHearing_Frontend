import { ShieldCheck } from 'lucide-react';
import { permissionsApi } from '../../api';
import { col } from '../../components/resource/columns';
import { ResourceListPage } from '../../components/resource/ResourceListPage';
import { Alert, Badge, Button, Checkbox, FormField, Input, LoadingState, Modal, QueryState, Switch, Textarea } from '../../components/ui';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useForm } from '../../hooks/useForm';
import { useMutation } from '../../hooks/useMutation';

const ROLE_FIELDS = [{ name: 'name', label: 'Role name', required: true }];

function PermissionMatrix({ catalogue, value, onChange, disabled }) {
  const set = new Set(value);
  const toggle = (key) => onChange(set.has(key) ? value.filter((k) => k !== key) : [...value, key]);
  const toggleModule = (mod) => {
    const keys = mod.actions.map((a) => a.key);
    const all = keys.every((k) => set.has(k));
    onChange(all ? value.filter((k) => !keys.includes(k)) : [...new Set([...value, ...keys])]);
  };

  return (
    <div className="card card-flush">
      <div className="table-scroll">
        <table className="table permission-matrix">
          <thead>
            <tr>
              <th>Module</th>
              <th>Permissions</th>
              <th className="text-right">All</th>
            </tr>
          </thead>
          <tbody>
            {catalogue.map((mod) => (
              <tr key={mod.module}>
                <td className="strong">{mod.label}</td>
                <td>
                  <div className="row" style={{ gap: 16 }}>
                    {mod.actions.map((a) => (
                      <Checkbox key={a.key} label={a.label} checked={disabled || set.has(a.key)} disabled={disabled} onChange={() => toggle(a.key)} />
                    ))}
                  </div>
                </td>
                <td className="text-right">
                  <Checkbox
                    aria-label={`All ${mod.label} permissions`}
                    checked={disabled || mod.actions.every((a) => set.has(a.key))}
                    disabled={disabled}
                    onChange={() => toggleModule(mod)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RoleFormBody({ title, initialValues, onSubmit, onClose, submitLabel }) {
  const catalogue = useApiQuery(() => permissionsApi.catalogue(), []);
  const form = useForm({ permissions: [], isAdmin: false, ...initialValues }, ROLE_FIELDS);
  const { mutate, loading, error } = useMutation(onSubmit);
  const isAdmin = Boolean(form.values.isAdmin);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.validate()) return;
    try {
      await mutate({ ...form.values, permissions: isAdmin ? ['*'] : form.values.permissions.filter((p) => p !== '*') });
    } catch (err) {
      form.applyServerErrors(err);
    }
  };

  return (
    <Modal
      open
      as="form"
      onSubmit={submit}
      onClose={onClose}
      size="xl"
      title={title}
      description="Permissions control which screens and actions are shown. The backend enforces them."
      footer={
        <>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {submitLabel}
          </Button>
        </>
      }
    >
      <div className="stack">
        {error && <Alert tone="danger" title="Could not save role">{error.message}</Alert>}
        <div className="form-grid">
          <FormField label="Role name" required error={form.errors.name}>
            {({ id }) => <Input id={id} value={form.values.name ?? ''} onChange={(e) => form.setValue('name', e.target.value)} />}
          </FormField>
          <FormField label="Administrator" hint="Administrators have access to every branch and permission.">
            {({ id }) => <Switch id={id} checked={isAdmin} onChange={(v) => form.setValue('isAdmin', v)} label="Full administrator access" />}
          </FormField>
          <FormField label="Description" className="span-12">
            {({ id }) => <Textarea id={id} rows={2} value={form.values.description ?? ''} onChange={(e) => form.setValue('description', e.target.value)} />}
          </FormField>
        </div>
        <QueryState loading={catalogue.loading} error={catalogue.error} onRetry={catalogue.refetch} resource="permissions" compact isEmpty={!catalogue.data?.length}>
          <PermissionMatrix
            catalogue={catalogue.data ?? []}
            value={form.values.permissions ?? []}
            disabled={isAdmin}
            onChange={(v) => form.setValue('permissions', v)}
          />
        </QueryState>
      </div>
    </Modal>
  );
}

function RoleFormModal({ open, loading, ...props }) {
  if (!open) return null;
  if (loading) {
    return (
      <Modal open onClose={props.onClose} title={props.title} size="xl">
        <LoadingState message="Loading role…" />
      </Modal>
    );
  }
  return <RoleFormBody {...props} />;
}

const rolesConfig = {
  resource: 'roles',
  title: 'Roles & permissions',
  singular: 'Role',
  eyebrow: 'Users & access',
  description: 'Admin users have broad access; store managers and other roles are restricted. The backend decides authorisation — this screen manages the configuration.',
  permissions: { create: 'users.create', edit: 'users.edit', delete: 'users.delete' },
  columns: [
    { key: 'name', header: 'Role', sortable: true, render: (r) => <span className="row"><ShieldCheck size={16} color="var(--color-primary)" /><strong>{r.name}</strong>{r.isAdmin && <Badge tone="brand">Admin</Badge>}</span> },
    col.text('description', 'Description', { sortable: false }),
    col.text('userCount', 'Users', { align: 'right' }),
    { key: 'permissions', header: 'Permissions', render: (r) => (r.permissions?.includes('*') ? 'All' : `${r.permissions?.length ?? 0} granted`) },
  ],
  FormComponent: RoleFormModal,
};

export function RolesPage() {
  return <ResourceListPage config={rolesConfig} />;
}
