import { col } from '../../components/resource/columns';
import { ResourceListPage } from '../../components/resource/ResourceListPage';

export const purchasesConfig = {
  resource: 'purchases',
  title: 'Purchases',
  singular: 'Purchase',
  eyebrow: 'Inventory',
  description: 'Stock actually received at a branch. When a purchase is marked as received, the backend books the units into the selected warehouse.',
  permissions: { create: 'purchases.create', edit: 'purchases.edit', delete: 'purchases.edit' },
  createPath: '/purchases/new',
  createLabel: 'Add purchase',
  detailPath: (r) => `/purchases/${r.id}`,
  editPath: (r) => `/purchases/${r.id}/edit`,
  defaultSort: { sortBy: 'date', sortDir: 'desc' },
  searchPlaceholder: 'Search number, supplier or reference…',
  columns: [
    { key: 'number', header: 'Purchase', sortable: true, render: (r) => <div><div className="strong">{r.number}</div><div className="entity-sub">{r.supplierReference || 'No supplier ref.'}</div></div> },
    col.text('supplierName', 'Supplier'),
    { key: 'branchName', header: 'Received into', render: (r) => <div>{r.branchName}<div className="entity-sub">{r.warehouseName}</div></div> },
    col.link('patientName', 'Allocated to', (r) => `/patients/${r.patientId}`),
    col.date('date', 'Date'),
    col.text('itemCount', 'Units', { align: 'right' }),
    col.currency('total', 'Total'),
    col.status('purchase'),
  ],
  filters: [
    { key: 'supplierId', label: 'Suppliers', options: { resource: 'suppliers' } },
    { key: 'branchId', label: 'Branches', options: { resource: 'branches' } },
    { key: 'status', label: 'Statuses', options: { status: 'purchase' } },
  ],
};

export function PurchasesListPage() {
  return <ResourceListPage config={purchasesConfig} />;
}
