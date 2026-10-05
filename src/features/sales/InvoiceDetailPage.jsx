import { Ban, CircleDollarSign, Download, FileCheck2, HeartPulse, Mail, Pencil, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { invoicesApi, paymentsApi } from '../../api';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  ConfirmDialog,
  DataTable,
  DetailList,
  PageHeader,
  QueryState,
  StatusBadge,
  Tabs,
  Timeline,
} from '../../components/ui';
import { optionLabel } from '../../config/statuses';
import { useToast } from '../../context/ToastContext';
import { useApiQuery } from '../../hooks/useApiQuery';
import { formatCurrency, formatDate, invoicePaidAmount, invoicePaymentStatus } from '../../utils/format';
import { RecordPaymentModal } from './RecordPaymentModal';

function InvoicePayments({ invoiceId }) {
  const q = useApiQuery(() => paymentsApi.list({ invoiceId, pageSize: 50 }), [invoiceId]);
  return (
    <DataTable
      compact
      resource="payments"
      loading={q.loading}
      error={q.error}
      onRetry={q.refetch}
      rows={q.data?.items ?? []}
      columns={[
        { key: 'number', header: 'Payment', render: (p) => <strong>{p.number}</strong> },
        { key: 'date', header: 'Date', render: (p) => formatDate(p.date) },
        { key: 'method', header: 'Method', render: (p) => optionLabel('paymentMethod', p.method) },
        { key: 'reference', header: 'Reference' },
        { key: 'amount', header: 'Amount', align: 'right', render: (p) => formatCurrency(p.amount) },
        { key: 'status', header: 'Status', render: (p) => <StatusBadge domain="payment" value={p.status} /> },
      ]}
    />
  );
}

function InvoiceHistory({ invoiceId }) {
  const q = useApiQuery(() => invoicesApi.history(invoiceId), [invoiceId]);
  return (
    <div className="card-body">
      <QueryState loading={q.loading} error={q.error} onRetry={q.refetch} resource="history" isEmpty={!q.data?.length} compact>
        <Timeline items={q.data ?? []} />
      </QueryState>
    </div>
  );
}

export function InvoiceDetailPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const toast = useToast();
  const { data: inv, loading, error, refetch } = useApiQuery(() => invoicesApi.get(id), [id]);
  const [tab, setTab] = useState('items');
  const [converting, setConverting] = useState(false);
  const [convertLoading, setConvertLoading] = useState(false);
  const [convertError, setConvertError] = useState(null);
  const [paying, setPaying] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  useEffect(() => {
    if (inv && params.get('print')) setTimeout(() => window.print(), 300);
  }, [inv, params]);

  const convert = async () => {
    setConvertLoading(true);
    setConvertError(null);
    try {
      await invoicesApi.convertToInvoice(id);
      toast.success('Converted to invoice');
      setConverting(false);
      refetch();
    } catch (err) {
      setConverting(false);
      setConvertError(err);
    } finally {
      setConvertLoading(false);
    }
  };

  const isDraft = inv && inv.type !== 'invoice';
  const canCancel = inv && inv.type === 'invoice' && inv.status !== 'cancelled' && Number(inv.balance) === Number(inv.total);

  const downloadPdf = async () => {
    setPdfLoading(true);
    try {
      await invoicesApi.downloadPdf(id, `${inv.number || 'invoice'}.pdf`);
    } catch (err) {
      toast.error('Unable to download PDF', err.message);
    } finally {
      setPdfLoading(false);
    }
  };

  const emailInvoice = async () => {
    setEmailLoading(true);
    try {
      await invoicesApi.email(id);
      toast.success('Invoice emailed');
    } catch (err) {
      toast.error('Unable to email invoice', err.message);
    } finally {
      setEmailLoading(false);
    }
  };

  const cancelInvoice = async () => {
    setCancelLoading(true);
    try {
      await invoicesApi.cancel(id);
      toast.success('Invoice cancelled', 'Stock has been restored.');
      setCancelling(false);
      refetch();
    } catch (err) {
      toast.error('Unable to cancel invoice', err.message);
      setCancelling(false);
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <QueryState loading={loading} error={error} onRetry={refetch} resource="invoice">
      {inv && (
        <div className="stack" style={{ gap: 24 }}>
          <PageHeader
            eyebrow={inv.type === 'invoice' ? 'Invoice' : inv.type === 'proforma' ? 'Pro forma' : 'Quote'}
            title={inv.number}
            actions={
              <>
                <Button icon={Download} loading={pdfLoading} onClick={downloadPdf}>
                  PDF
                </Button>
                <Button icon={Mail} loading={emailLoading} onClick={emailInvoice}>
                  Email
                </Button>
                <Button icon={Printer} onClick={() => window.print()}>
                  Print
                </Button>
                {isDraft && (
                  <Button icon={Pencil} to={`/invoices/${inv.id}/edit`}>
                    Edit
                  </Button>
                )}
                {isDraft && (
                  <Button variant="primary" icon={FileCheck2} onClick={() => setConverting(true)}>
                    Convert to invoice
                  </Button>
                )}
                {canCancel && (
                  <Button icon={Ban} onClick={() => setCancelling(true)}>
                    Cancel invoice
                  </Button>
                )}
                {!isDraft && inv.balance > 0 && (
                  <>
                    <Button icon={HeartPulse} to={`/claims?invoiceId=${inv.id}`}>
                      Medical claim
                    </Button>
                    <Button variant="primary" icon={CircleDollarSign} onClick={() => setPaying(true)}>
                      Record payment
                    </Button>
                  </>
                )}
              </>
            }
          >
            <div className="row" style={{ marginTop: 10 }}>
              <StatusBadge domain="invoiceType" value={inv.type} dot={false} />
              <StatusBadge domain="invoice" value={inv.status} />
            </div>
          </PageHeader>

          {convertError && (
            <Alert tone="danger" title="Unable to convert to invoice">
              {convertError.message}
            </Alert>
          )}

          <div className="grid grid-main-aside" style={{ alignItems: 'start' }}>
            <div className="stack">
              <Card>
                <CardBody>
                  <DetailList
                    columns={3}
                    items={[
                      { label: 'Patient', value: <Link to={`/patients/${inv.patientId}`}>{inv.patientName}</Link> },
                      { label: 'Branch', value: inv.branchName },
                      { label: 'Warehouse', value: inv.warehouseName },
                      { label: 'Date', value: formatDate(inv.date) },
                      { label: inv.type === 'quote' ? 'Valid until' : 'Due date', value: formatDate(inv.dueDate) },
                      { label: 'Created by', value: inv.createdByName },
                    ]}
                  />
                </CardBody>
              </Card>
              <Card flush>
                <div style={{ padding: '8px 20px 0' }}>
                  <Tabs
                    value={tab}
                    onChange={setTab}
                    tabs={[
                      { key: 'items', label: 'Items', count: inv.lines?.length ?? 0 },
                      { key: 'payments', label: 'Payments' },
                      { key: 'history', label: 'History' },
                    ]}
                  />
                </div>
                {tab === 'items' && (
                  <DataTable
                    resource="items"
                    rows={inv.lines ?? []}
                    columns={[
                      {
                        key: 'productName',
                        header: 'Item',
                        render: (l) => (
                          <div>
                            <div className="strong">{l.productName}</div>
                            <div className="row" style={{ marginTop: 4 }}>
                              <StatusBadge domain="productType" value={l.type} dot={false} />
                              {l.serialNumbers?.length > 0 && <span className="text-sm muted mono">S/N {l.serialNumbers.join(', ')}</span>}
                            </div>
                          </div>
                        ),
                      },
                      { key: 'quantity', header: 'Qty', align: 'right' },
                      { key: 'unitPrice', header: 'Unit price', align: 'right', render: (l) => formatCurrency(l.unitPrice) },
                      { key: 'vatRate', header: 'VAT', align: 'right', render: (l) => `${l.vatRate ?? 0}%` },
                      { key: 'total', header: 'Line total', align: 'right', render: (l) => <strong>{formatCurrency(l.total)}</strong> },
                    ]}
                  />
                )}
                {tab === 'payments' && <InvoicePayments invoiceId={inv.id} />}
                {tab === 'history' && <InvoiceHistory invoiceId={inv.id} />}
              </Card>
            </div>
            <Card>
              <CardHeader title="Totals" />
              <CardBody>
                <div className="kbd-total">
                  <span className="muted">Subtotal</span>
                  <span>{formatCurrency(inv.subtotal)}</span>
                </div>
                <div className="kbd-total">
                  <span className="muted">VAT</span>
                  <span>{formatCurrency(inv.vat)}</span>
                </div>
                <div className="kbd-total grand">
                  <span>Total</span>
                  <span>{formatCurrency(inv.total)}</span>
                </div>
                {inv.type === 'invoice' && (
                  <>
                    <div className="kbd-total" style={{ marginTop: 8 }}>
                      <span className="muted">Paid</span>
                      <span>{formatCurrency(invoicePaidAmount(inv))}</span>
                    </div>
                    <div className="kbd-total">
                      <span className="strong">Balance due</span>
                      <Badge tone={inv.balance > 0 ? 'warning' : 'success'}>{formatCurrency(inv.balance)}</Badge>
                    </div>
                    <div className="kbd-total">
                      <span className="muted">Payment</span>
                      <StatusBadge domain="invoicePayment" value={invoicePaymentStatus(inv)} />
                    </div>
                  </>
                )}
              </CardBody>
            </Card>
          </div>

          <ConfirmDialog
            open={converting}
            onClose={() => setConverting(false)}
            onConfirm={convert}
            loading={convertLoading}
            tone="primary"
            title="Convert to invoice?"
            message={`${inv.number} will become a final tax invoice. Stock for physical products will be taken from ${inv.warehouseName} if available.`}
            confirmLabel="Convert to invoice"
          />
          <ConfirmDialog
            open={cancelling}
            onClose={() => setCancelling(false)}
            onConfirm={cancelInvoice}
            loading={cancelLoading}
            title="Cancel this invoice?"
            message="Stock for physical products will be returned to the warehouse. This is only allowed when the invoice has no payments."
            confirmLabel="Cancel invoice"
          />
          <RecordPaymentModal open={paying} onClose={() => setPaying(false)} invoice={inv} onDone={refetch} />
        </div>
      )}
    </QueryState>
  );
}
