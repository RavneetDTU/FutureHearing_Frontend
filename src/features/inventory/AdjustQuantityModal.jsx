import { stockApi } from '../../api';
import { EntityFormModal } from '../../components/resource/EntityFormModal';
import { useToast } from '../../context/ToastContext';

const REASONS = [
  { value: 'stock_count', label: 'Stock count correction' },
  { value: 'damaged', label: 'Damaged / broken' },
  { value: 'transfer', label: 'Warehouse transfer' },
  { value: 'loan', label: 'Loan / trial unit' },
  { value: 'returned', label: 'Returned by patient' },
  { value: 'other', label: 'Other' },
];

const FIELDS = [
  {
    name: 'productId',
    label: 'Product',
    type: 'async',
    resource: 'products',
    params: { type: 'standard' },
    labelField: 'productName',
    required: true,
    span: 12,
    placeholder: 'Search standard products…',
    getMeta: (r) => r.sku,
  },
  { name: 'branchId', label: 'Branch', type: 'select', required: true, options: { resource: 'branches', params: { status: 'active' } } },
  {
    name: 'warehouseId',
    label: 'Warehouse',
    type: 'select',
    required: true,
    options: { resource: 'warehouses', dependsOn: 'branchId' },
    dependsOnMessage: 'Select a branch first',
  },
  {
    name: 'direction',
    label: 'Adjustment',
    type: 'segmented',
    required: true,
    options: [
      { value: 'add', label: 'Add stock' },
      { value: 'remove', label: 'Remove stock' },
    ],
  },
  { name: 'quantity', label: 'Quantity', type: 'number', required: true, min: 1, step: 1 },
  { name: 'reason', label: 'Reason', type: 'select', required: true, options: REASONS, span: 12 },
  { name: 'notes', label: 'Notes', type: 'textarea', rows: 3, span: 12, placeholder: 'Optional details for the audit trail' },
];

/** Captures a stock adjustment request. The backend performs and validates the actual stock change. */
export function AdjustQuantityModal({ open, onClose, product, defaults = {}, onDone }) {
  const toast = useToast();
  return (
    <EntityFormModal
      open={open}
      onClose={onClose}
      size="md"
      title="Adjust quantity"
      description="Stock levels are updated by the backend after the adjustment is accepted."
      submitLabel="Submit adjustment"
      fields={FIELDS}
      initialValues={{
        productId: product?.id ?? '',
        productName: product?.name ?? '',
        direction: 'add',
        quantity: 1,
        reason: '',
        ...defaults,
      }}
      onSubmit={async (values) => {
        await stockApi.adjust({ ...values, quantity: Number(values.quantity) });
        toast.success('Adjustment submitted', `${values.direction === 'add' ? 'Add' : 'Remove'} ${values.quantity} × ${values.productName}`);
        onDone?.();
        onClose();
      }}
    />
  );
}
