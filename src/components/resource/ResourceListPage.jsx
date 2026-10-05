import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resources } from '../../api';
import { useSession } from '../../context/SessionContext';
import { useToast } from '../../context/ToastContext';
import { useListQuery } from '../../hooks/useListQuery';
import { Alert, Button, Card, ConfirmDialog, DataTable, DetailList, Drawer, FilterBar, Modal, PageHeader, Pagination } from '../ui';
import { EntityFormModal } from './EntityFormModal';

/**
 * Config-driven list page with search, filters, sorting, pagination, add/edit modal,
 * view drawer and delete confirmation. See src/features/catalog/resources.jsx for examples.
 */
export function ResourceListPage({
  config,
  embedded = false,
  baseParams,
  initialValues: extraInitial,
  initialSearch = '',
  openCreateWith,
}) {
  const {
    resource,
    title,
    singular,
    eyebrow,
    description,
    columns,
    filters = [],
    fields = [],
    defaultValues = {},
    searchPlaceholder,
    viewItems,
    detailPath,
    permissions = {},
    toFormValues = (row) => row,
    toPayload,
    rowExtraActions,
    headerActions,
    formSize,
    defaultSort,
    readOnly = false,
    allowCreate = true,
    allowEdit = true,
    FormComponent,
    createPath,
    editPath,
    createLabel,
  } = config;

  const service = resources[resource];
  const toast = useToast();
  const navigate = useNavigate();
  const { can } = useSession();
  const list = useListQuery(service.list, {
    filters: Object.fromEntries(filters.map((f) => [f.key, ''])),
    search: initialSearch,
    sortBy: defaultSort?.sortBy,
    sortDir: defaultSort?.sortDir,
    baseParams,
  });

  const [form, setForm] = useState(() =>
    openCreateWith ? { mode: 'create', record: { status: 'active', ...defaultValues, ...extraInitial, ...openCreateWith } } : null,
  ); // { mode: 'create'|'edit', record, loading }
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [createdSecret, setCreatedSecret] = useState(null);

  const singularLower = singular.toLowerCase();

  const openCreate = () => {
    if (createPath) navigate(createPath);
    else setForm({ mode: 'create', record: { status: 'active', ...defaultValues, ...extraInitial } });
  };
  const openEdit = async (row) => {
    if (editPath) {
      navigate(editPath(row));
      return;
    }
    setForm({ mode: 'edit', record: row, loading: true });
    try {
      const record = await service.get(row.id);
      setForm({ mode: 'edit', record });
    } catch (err) {
      setForm(null);
      toast.error(`Unable to load ${singularLower}`, err.message);
    }
  };

  const handleSubmit = async (values) => {
    const payload = (toPayload ?? ((next) =>
      Object.fromEntries(
        fields.filter((field) => field?.name && field.type !== 'heading' && next[field.name] !== undefined).map((field) => [field.name, next[field.name]]),
      )))(values);
    const saved = form.mode === 'create' ? await service.create(payload) : await service.update(form.record.id, payload);
    toast.success(`${singular} ${form.mode === 'create' ? 'created' : 'updated'}`);
    setForm(null);
    if (saved?.temporaryPassword) {
      setCreatedSecret({ name: saved.fullName || saved.name || singular, temporaryPassword: saved.temporaryPassword });
    }
    list.refetch();
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await service.remove(deleting.id);
      toast.success(`${singular} deleted`);
      setDeleting(null);
      list.refetch();
    } catch (err) {
      toast.error(`Unable to delete ${singularLower}`, err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const rowActions = (row) => [
    detailPath
      ? { label: 'View', icon: Eye, to: detailPath(row) }
      : viewItems && { label: 'View', icon: Eye, onClick: () => setViewing(row) },
    !readOnly && allowEdit && { label: 'Edit', icon: Pencil, onClick: () => openEdit(row), hidden: !can(permissions.edit) },
    ...(rowExtraActions ? rowExtraActions(row, { navigate, refetch: list.refetch, toast }) : []),
    !readOnly && { divider: true, hidden: !can(permissions.delete) },
    !readOnly && {
      label: 'Delete',
      icon: Trash2,
      danger: true,
      onClick: () => setDeleting(row),
      hidden: !can(permissions.delete),
    },
  ].filter(Boolean);

  const createButton =
    !readOnly && allowCreate && can(permissions.create) ? (
      <Button variant="primary" icon={Plus} onClick={openCreate}>
        {createLabel ?? `Add ${singularLower}`}
      </Button>
    ) : null;

  const Form = FormComponent ?? EntityFormModal;

  return (
    <>
      {!embedded && (
        <PageHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
          actions={
            <>
              {headerActions}
              {createButton}
            </>
          }
        />
      )}

      <Card flush>
        <FilterBar list={list} filters={filters} searchPlaceholder={searchPlaceholder ?? `Search ${title.toLowerCase()}…`}>
          {embedded && createButton && <div style={{ marginLeft: 'auto' }}>{createButton}</div>}
        </FilterBar>
        <DataTable
          columns={columns}
          rows={list.items}
          loading={list.loading}
          error={list.error}
          onRetry={list.refetch}
          resource={title.toLowerCase()}
          sort={list.sort}
          onSort={list.toggleSort}
          rowActions={rowActions}
          onRowClick={detailPath ? (row) => navigate(detailPath(row)) : viewItems ? setViewing : undefined}
          emptyAction={!list.search && createButton}
        />
        {!list.error && (
          <Pagination
            page={list.page}
            pageSize={list.pageSize}
            total={list.total}
            onPageChange={list.setPage}
            onPageSizeChange={list.setPageSize}
          />
        )}
      </Card>

      <Form
        open={Boolean(form)}
        loading={form?.loading}
        title={form?.mode === 'edit' ? `Edit ${singularLower}` : `Add ${singularLower}`}
        fields={fields}
        initialValues={form ? toFormValues(form.record) : {}}
        record={form?.record}
        onSubmit={handleSubmit}
        onClose={() => setForm(null)}
        submitLabel={form?.mode === 'edit' ? 'Save changes' : `Create ${singularLower}`}
        size={formSize}
      />

      {viewItems && (
        <Drawer
          open={Boolean(viewing)}
          onClose={() => setViewing(null)}
          title={viewing ? (viewing.name ?? viewing.fullName ?? viewing.code ?? singular) : ''}
          description={singular}
          footer={
            !readOnly &&
            allowEdit &&
            can(permissions.edit) && (
              <Button
                variant="primary"
                icon={Pencil}
                onClick={() => {
                  const row = viewing;
                  setViewing(null);
                  openEdit(row);
                }}
              >
                Edit {singularLower}
              </Button>
            )
          }
        >
          {viewing && <DetailList columns={1} items={viewItems(viewing)} />}
        </Drawer>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title={`Delete ${singularLower}?`}
        message={`"${deleting?.name ?? deleting?.fullName ?? deleting?.code ?? deleting?.number ?? ''}" will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete"
      />

      <Modal
        open={Boolean(createdSecret)}
        onClose={() => setCreatedSecret(null)}
        title="Temporary password"
        footer={
          <Button variant="primary" onClick={() => setCreatedSecret(null)}>
            Done
          </Button>
        }
      >
        <Alert tone="warning" title={`${createdSecret?.name} was created`}>
          Invite email is only sent when SMTP is configured. Copy this password now — it is shown once.
        </Alert>
        <p className="mono" style={{ fontSize: 18, margin: '16px 0 0' }}>
          {createdSecret?.temporaryPassword}
        </p>
      </Modal>
    </>
  );
}
