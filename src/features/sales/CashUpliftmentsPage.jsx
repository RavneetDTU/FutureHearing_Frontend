import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ApiError, cashUpliftmentsApi, warehousesApi } from '../../api';
import { EntityFormModal } from '../../components/resource/EntityFormModal';
import { Button, Card, DataTable, PageHeader, Pagination, SearchBar } from '../../components/ui';
import { useToast } from '../../context/ToastContext';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useListQuery } from '../../hooks/useListQuery';
import { formatCurrency, formatDateTime } from '../../utils/format';

function warehouseLabel(warehouse) {
  if (!warehouse) return '';
  return warehouse.branchName || warehouse.name || '';
}

function placeName(value) {
  if (!value) return '';
  if (value.includes(' · ')) return value.split(' · ').pop();
  return value.replace(/^Main Stock\s*[·-]\s*/i, '').replace(/^Broken Stock\s*[·-]\s*/i, '') || value;
}

function packDetails(values) {
  return JSON.stringify({
    monthCollected: values.monthCollected || '',
    collectedBy: values.collectedBy || '',
    collected: values.collected || 'yes',
    warehouseName: values.warehouseName || '',
  });
}

function unpackDetails(row) {
  const plainNotes = typeof row.notes === 'string' && !row.notes.trim().startsWith('{') ? row.notes : '';
  const fallback = {
    monthCollected: row.monthCollected || plainNotes,
    collectedBy: row.collectedBy || '',
    collected: row.collected,
    warehouseName: row.warehouseName || row.branchName,
  };
  if (!row.notes || typeof row.notes !== 'string' || !row.notes.trim().startsWith('{')) return fallback;
  try {
    const parsed = JSON.parse(row.notes);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return fallback;
    return {
      monthCollected: parsed.monthCollected || fallback.monthCollected,
      collectedBy: parsed.collectedBy || fallback.collectedBy,
      collected: parsed.collected ?? fallback.collected,
      warehouseName: parsed.warehouseName || fallback.warehouseName,
    };
  } catch {
    return fallback;
  }
}

function collectionLabel(row) {
  const collected = unpackDetails(row).collected;
  if (collected === false || collected === 'no' || collected === 'No') return 'NO';
  return 'YES';
}

const COLUMNS = [
  { key: 'reference', header: 'Reference Id', sortable: true, render: (r) => <span className="strong">{r.reference ?? '0'}</span> },
  { key: 'calculatedAt', header: 'Date Created', sortable: true, render: (r) => formatDateTime(r.calculatedAt) },
  { key: 'warehouse', header: 'Warehouse', render: (r) => placeName(unpackDetails(r).warehouseName) },
  { key: 'amount', header: 'Amount', align: 'right', render: (r) => formatCurrency(r.collectedAmount ?? r.amount) },
  { key: 'collected', header: 'Collection status', render: (r) => collectionLabel(r) },
  { key: 'monthCollected', header: 'Month collected', render: (r) => unpackDetails(r).monthCollected },
  { key: 'collectedBy', header: 'Collected By', render: (r) => unpackDetails(r).collectedBy || r.collectedBy },
];

export function CashUpliftmentsPage() {
  const toast = useToast();
  const list = useListQuery(cashUpliftmentsApi.list, {
    sortBy: 'calculatedAt',
    sortDir: 'desc',
  });
  const warehouses = useApiQuery(() => warehousesApi.list({ status: 'active', pageSize: 100 }), []);
  const warehouseOptions = useMemo(
    () => (warehouses.data?.items ?? []).map((warehouse) => ({ value: warehouse.id, label: warehouseLabel(warehouse) })),
    [warehouses.data],
  );
  const fields = useMemo(
    () => [
      {
        name: 'warehouseId',
        label: 'Warehouse',
        type: 'select',
        required: true,
        options: warehouseOptions,
        span: 12,
      },
      { name: 'amount', label: 'Amount', type: 'currency', required: true, min: 0, span: 12 },
      { name: 'collected', label: 'Collected', type: 'select', required: true, options: 'yesNo', span: 12 },
      { name: 'monthCollected', label: 'Month collected', span: 12 },
      { name: 'collectedBy', label: 'Collected By', span: 12, placeholder: '' },
    ],
    [warehouseOptions],
  );
  const [adding, setAdding] = useState(false);

  return (
    <>
      <PageHeader
        eyebrow="Cash"
        title="Cash Upliftments"
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setAdding(true)}>
            Add Upliftment
          </Button>
        }
      />
      <Card flush>
        <div className="toolbar">
          <SearchBar value={list.search} onChange={list.setSearch} placeholder="Search…" />
          <span className="result-count">
            <b>{list.total}</b>
            <span>records shown</span>
          </span>
        </div>
        <DataTable
          resource="cash upliftments"
          columns={COLUMNS}
          rows={list.items}
          loading={list.loading}
          error={list.error}
          onRetry={list.refetch}
          sort={list.sort}
          onSort={list.toggleSort}
          emptyTitle="No upliftment records"
          emptyMessage="Add an upliftment to record cash collected from a warehouse."
        />
        {!list.error && (
          <Pagination page={list.page} pageSize={list.pageSize} total={list.total} onPageChange={list.setPage} onPageSizeChange={list.setPageSize} />
        )}
      </Card>

      <EntityFormModal
        open={adding}
        onClose={() => setAdding(false)}
        size="md"
        title="Add cash upliftment"
        submitLabel="Add"
        fields={fields}
        initialValues={{ collected: 'yes', collectedBy: '', monthCollected: '', amount: '', warehouseId: '', branchId: '', warehouseName: '' }}
        onSubmit={async (values) => {
          let branchId = values.branchId;
          let warehouseName = values.warehouseName;
          if (values.warehouseId) {
            const warehouse = await warehousesApi.get(values.warehouseId);
            branchId = branchId || warehouse?.branchId;
            warehouseName = warehouseName || warehouseLabel(warehouse);
          }
          if (!branchId) {
            throw new ApiError('Choose a warehouse.', { status: 422, fieldErrors: { warehouseId: 'Choose a warehouse.' } });
          }
          const details = packDetails({ ...values, warehouseName });
          const payload = {
            branchId,
            collectedAmount: Number(values.amount),
            collectedBy: values.collectedBy || null,
            notes: details,
          };
          let saved;
          try {
            saved = await cashUpliftmentsApi.create(payload);
          } catch (err) {
            if (!err.fieldErrors?.collectedBy) throw err;
            saved = await cashUpliftmentsApi.create({
              branchId: payload.branchId,
              collectedAmount: payload.collectedAmount,
              notes: payload.notes,
            });
          }
          toast.success('Cash upliftment recorded', saved?.reference);
          setAdding(false);
          list.refetch();
        }}
      />
    </>
  );
}
