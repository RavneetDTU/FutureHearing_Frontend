import { ApiError, paymentsApi } from '../../api';
import { EntityFormModal } from '../../components/resource/EntityFormModal';
import { useSession } from '../../context/SessionContext';
import { useToast } from '../../context/ToastContext';
import { canSeePrices } from '../../utils/access';
import { formatCurrency } from '../../utils/format';

const FIELDS = [
  { name: 'amount', label: 'Amount', type: 'currency', required: true, min: 0.01 },
  { name: 'method', label: 'Payment method', type: 'select', required: true, options: 'paymentMethod' },
  { name: 'date', label: 'Payment date', type: 'date', required: true },
  { name: 'reference', label: 'Reference', placeholder: 'POS slip, EFT reference…' },
  { name: 'notes', label: 'Notes', type: 'textarea', rows: 2, span: 12 },
];

export function RecordPaymentModal({ open, onClose, invoice, onDone }) {
  const toast = useToast();
  const { user } = useSession();
  const seePrices = canSeePrices(user);
  return (
    <EntityFormModal
      open={open}
      onClose={onClose}
      size="md"
      title="Record payment"
      description={invoice ? (seePrices ? `${invoice.number} · Balance ${formatCurrency(invoice.balance)}` : invoice.number) : undefined}
      submitLabel="Record payment"
      fields={seePrices ? FIELDS : FIELDS.filter((field) => field.type !== 'currency')}
      initialValues={{ amount: invoice?.balance ?? '', method: 'card', date: new Date().toISOString().slice(0, 10) }}
      onSubmit={async (values) => {
        const amount = Number(values.amount);
        const balance = Number(invoice?.balance ?? 0);
        if (Number.isFinite(balance) && amount > balance) {
          throw new ApiError('A payment larger than the outstanding balance is rejected.', {
            status: 422,
            fieldErrors: { amount: seePrices ? `Cannot exceed the outstanding balance of ${formatCurrency(balance)}.` : 'Cannot exceed the outstanding balance.' },
          });
        }
        await paymentsApi.create({
          invoiceId: invoice.id,
          patientId: invoice.patientId || null,
          amount,
          method: values.method,
          date: values.date || null,
          reference: values.reference || null,
          notes: values.notes || null,
        });
        toast.success('Payment recorded', seePrices ? formatCurrency(amount) : undefined);
        onDone?.();
        onClose();
      }}
    />
  );
}
