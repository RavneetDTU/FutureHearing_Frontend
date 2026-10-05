import clsx from 'clsx';
import {
  Building2,
  Code2,
  Cog,
  FileText,
  HeartPulse,
  Package,
  Receipt,
  Stethoscope,
  Store,
  UserCircle,
  Users,
  Warehouse,
} from 'lucide-react';
import { NavLink, Navigate, useParams } from 'react-router-dom';
import { settingsApi } from '../../api';
import { SchemaForm } from '../../components/forms/SchemaForm';
import { ResourceListPage } from '../../components/resource/ResourceListPage';
import { Alert, Button, Card, CardBody, CardFooter, CardHeader, DetailList, PageHeader, QueryState } from '../../components/ui';
import { useSession } from '../../context/SessionContext';
import { useToast } from '../../context/ToastContext';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useForm } from '../../hooks/useForm';
import { useMutation } from '../../hooks/useMutation';
import { usersConfig } from '../admin/resources';
import { branchesConfig, practicesConfig, warehousesConfig } from '../inventory/resources';
import { icdCodesConfig, medicalAidsConfig, procedureCodesConfig } from '../medical/resources';
import { SETTINGS_FIELDS } from './settingsFields';

const SECTIONS = [
  { key: 'general', label: 'General', icon: Cog, description: 'Business details printed on documents.' },
  { key: 'branches', label: 'Branches', icon: Store, config: branchesConfig },
  { key: 'warehouses', label: 'Warehouses', icon: Warehouse, config: warehousesConfig },
  { key: 'practices', label: 'Practices', icon: Stethoscope, config: practicesConfig },
  { key: 'users', label: 'Users', icon: Users, config: usersConfig },
  { key: 'medical-aids', label: 'Medical aids', icon: HeartPulse, config: medicalAidsConfig },
  { key: 'icd-codes', label: 'ICD codes', icon: Code2, config: icdCodesConfig },
  { key: 'procedure-codes', label: 'Procedure codes', icon: FileText, config: procedureCodesConfig },
  { key: 'invoice', label: 'Invoice settings', icon: Receipt, description: 'Numbering, VAT defaults and printed invoice content.' },
  { key: 'product', label: 'Product settings', icon: Package, description: 'Defaults applied when creating products and receiving stock.' },
  { key: 'system', label: 'System settings', icon: Building2, description: 'Session, notifications and integrations.' },
  { key: 'profile', label: 'My profile', icon: UserCircle },
];

function SettingsForm({ section, initialValues, onSaved }) {
  const toast = useToast();
  const fields = SETTINGS_FIELDS[section.key];
  const form = useForm(initialValues, fields);
  const { mutate, loading, error } = useMutation((values) => settingsApi.update(section.key, values));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.validate()) return;
    try {
      await mutate(form.values);
      toast.success(`${section.label} saved`);
      onSaved();
    } catch (err) {
      form.applyServerErrors(err);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
    <Card>
      <CardHeader title={section.label} subtitle={section.description} />
      <CardBody>
        <div className="stack">
          {error && <Alert tone="danger" title="Could not save settings">{error.message}</Alert>}
          <SchemaForm fields={fields} form={form} />
        </div>
      </CardBody>
      <CardFooter>
        <Button onClick={() => form.reset(initialValues)} disabled={loading}>
          Discard changes
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          Save settings
        </Button>
      </CardFooter>
    </Card>
    </form>
  );
}

function SettingsSection({ section }) {
  const q = useApiQuery(() => settingsApi.get(section.key), [section.key]);
  return (
    <QueryState loading={q.loading} error={q.error} onRetry={q.refetch} resource={section.label.toLowerCase()}>
      {q.data && <SettingsForm key={section.key} section={section} initialValues={q.data} onSaved={q.refetch} />}
    </QueryState>
  );
}

function ProfileSection() {
  const { user, branchId } = useSession();
  return (
    <Card>
      <CardHeader title="My profile" subtitle="Your account as returned by the API. Contact an administrator to change your role or branch access." />
      <CardBody>
        <DetailList
          items={[
            { label: 'Name', value: user?.fullName },
            { label: 'Email', value: user?.email },
            { label: 'Role', value: user?.roleName },
            { label: 'Selected branch', value: branchId || 'All branches' },
          ]}
        />
      </CardBody>
    </Card>
  );
}

export function SettingsPage() {
  const { section: key = 'general' } = useParams();
  const section = SECTIONS.find((s) => s.key === key);
  if (!section) return <Navigate to="/settings" replace />;

  return (
    <div className="stack" style={{ gap: 24 }}>
      <PageHeader eyebrow="Administration" title="Settings" description="Configure the business, branches, medical aid data and system behaviour." />
      <div className="settings-layout">
        <Card className="settings-nav">
          <nav aria-label="Settings sections" className="stack-xs">
            {SECTIONS.map((s) => (
              <NavLink
                key={s.key}
                to={s.key === 'general' ? '/settings' : `/settings/${s.key}`}
                end
                className={({ isActive }) => clsx('option', (isActive || (s.key === 'general' && key === 'general')) && 'is-selected')}
              >
                <s.icon size={16} />
                {s.label}
              </NavLink>
            ))}
          </nav>
        </Card>
        <div style={{ minWidth: 0 }}>
          {section.config ? (
            <div className="stack-sm">
              <div>
                <h2 className="card-title">{section.config.title}</h2>
                {section.config.description && <p className="card-subtitle">{section.config.description}</p>}
              </div>
              <ResourceListPage key={section.key} embedded config={section.config} />
            </div>
          ) : section.key === 'profile' ? (
            <ProfileSection />
          ) : (
            <SettingsSection section={section} />
          )}
        </div>
      </div>
    </div>
  );
}
