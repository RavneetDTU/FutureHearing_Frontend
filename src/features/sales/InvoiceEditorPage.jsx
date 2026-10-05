import { AlertTriangle, CheckCircle2, ClipboardList, FileCheck2, Plus, Save, Trash2, UserPlus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { invoicesApi, stockApi } from '../../api';
import {
  Alert,
  AsyncSelect,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  DatePicker,
  EmptyState,
  FormField,
  Input,
  MultiSelect,
  PageHeader,
  QueryState,
  ResourceSelect,
  Select,
  Spinner,
  StatusBadge,
  Textarea,
} from '../../components/ui';
import { useSession } from '../../context/SessionContext';
import { useToast } from '../../context/ToastContext';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useOptions } from '../../hooks/useOptions';
import { formatCurrency } from '../../utils/format';
import { FullTestModal } from './FullTestModal';
import { ProductPickerModal } from './ProductPickerModal';

const today = () => new Date().toISOString().slice(0, 10);

const DOCUMENT_TYPES = [
  { value: 'quote', label: 'Quote', hint: 'Editable · no stock movement' },
  { value: 'proforma', label: 'Pro forma', hint: 'Editable · no stock movement' },
  { value: 'invoice', label: 'Invoice', hint: 'Final · stock required' },
];

function newEditorState(user, params) {
  const type = DOCUMENT_TYPES.some((t) => t.value === params.get('type')) ? params.get('type') : 'invoice';
  return {
    header: {
      type,
      patientId: params.get('patientId') ?? '',
      patientName: params.get('patientName') ?? '',
      branchId: user?.defaultBranchId ?? '',
      warehouseId: user?.defaultBranchId ? (user?.defaultWarehouseId ?? '') : '',
      date: today(),
      dueDate: '',
      reference: '',
      notes: '',
      icdCodeIds: [],
    },
    lines: [],
    openFullTest: params.get('fullTest') === '1',
  };
}

function fromInvoice(inv) {
  return {
    header: {
      type: inv.type,
      patientId: inv.patientId,
      patientName: inv.patientName,
      branchId: inv.branchId,
      warehouseId: inv.warehouseId,
      date: inv.date,
      dueDate: inv.dueDate ?? '',
      reference: inv.reference ?? '',
      notes: inv.notes ?? '',
      icdCodeIds: inv.icdCodeIds ?? [],
    },
    lines: (inv.lines ?? []).map((l, i) => ({ ...l, key: `l${i}` })),
  };
}

function toPayload(header, lines, type) {
  return {
    type,
    patientId: header.patientId,
    branchId: header.branchId,
    warehouseId: header.warehouseId,
    date: header.date || null,
    dueDate: header.dueDate || null,
    reference: header.reference || null,
    notes: header.notes || null,
    icdCodeIds: header.icdCodeIds ?? [],
    lines: lines.map((l) => ({
      productId: l.productId,
      quantity: Number(l.quantity),
      unitPrice: Number(l.unitPrice),
      vatRate: l.vatRate === '' || l.vatRate == null ? null : Number(l.vatRate),
      icdCodeIds: l.icdCodeIds ?? [],
      procedureCodeId: l.procedureCodeId || null,
      fullTestId: l.fullTestId || null,
      serialNumbers: l.serialNumbers?.filter(Boolean).length ? l.serialNumbers.filter(Boolean) : null,
    })),
  };
}

function InvoiceEditor({ initial, invoiceId }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [header, setHeader] = useState(initial.header);
  const [lines, setLines] = useState(initial.lines);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [saving, setSaving] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [fullTestOpen, setFullTestOpen] = useState(Boolean(initial.openFullTest));
  const seq = useRef(initial.lines.length);

  const icd = useOptions('icdCodes', { status: 'active' });
  const procedures = useOptions('procedureCodes', { status: 'active' });
  const warehouses = useOptions('warehouses', { branchId: header.branchId, status: 'active' }, { enabled: Boolean(header.branchId) });

  // Pre-select the branch's default warehouse (flagged by the API) when none is chosen.
  useEffect(() => {
    if (header.warehouseId || warehouses.loading) return;
    const own = warehouses.options.filter((o) => o.raw.branchId === header.branchId);
    const preferred = own.find((o) => o.raw.isDefault) ?? own[0];
    if (preferred) setHeader((h) => ({ ...h, warehouseId: preferred.value }));
  }, [warehouses.options, warehouses.loading, header.warehouseId, header.branchId]);

  const set = (key, value) => {
    setHeader((h) => ({ ...h, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  // Availability and totals come from the backend; requests are debounced while editing.
  const stockLines = lines.filter((l) => l.type === 'standard').map((l) => ({ productId: l.productId, quantity: Number(l.quantity) || 0 }));
  const stockKey = useDebouncedValue(JSON.stringify(stockLines), 400);
  const availability = useApiQuery(
    () => stockApi.checkAvailability({ warehouseId: header.warehouseId, lines: JSON.parse(stockKey) }),
    [header.warehouseId, stockKey],
    { enabled: Boolean(header.warehouseId) && stockKey !== '[]' },
  );
  const availabilityFor = (productId) => availability.data?.lines?.find((a) => a.productId === productId);
  const hasStockIssue = stockLines.length > 0 && availability.data?.lines?.some((a) => !a.sufficient);
  const serials = useApiQuery(
    () => stockApi.serials({ warehouseId: header.warehouseId, status: 'available', pageSize: 100 }),
    [header.warehouseId],
    { enabled: Boolean(header.warehouseId) },
  );
  const serialOptionsFor = (productId) =>
    (serials.data?.items ?? [])
      .filter((s) => s.productId === productId)
      .map((s) => ({ value: s.serialNumber, label: s.serialNumber }));

  const totalsKey = useDebouncedValue(
    JSON.stringify(lines.map((l) => ({ productId: l.productId, quantity: Number(l.quantity) || 0, unitPrice: Number(l.unitPrice) || 0, vatRate: l.vatRate }))),
    400,
  );
  const totals = useApiQuery(() => invoicesApi.calculateTotals({ lines: JSON.parse(totalsKey) }), [totalsKey]);

  const updateLine = (key, patch) => setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  const removeLine = (key) => setLines((ls) => ls.filter((l) => l.key !== key));

  const addProduct = (p) => {
    setErrors((e) => ({ ...e, lines: undefined }));
    setLines((ls) => {
      const existing = p.type === 'standard' && ls.find((l) => l.productId === p.id && !l.fullTestId);
      if (existing) return ls.map((l) => (l === existing ? { ...l, quantity: Number(l.quantity) + 1 } : l));
      return [
        ...ls,
        {
          key: `n${++seq.current}`,
          productId: p.id,
          productName: p.name,
          sku: p.sku,
          type: p.type,
          quantity: 1,
          unitPrice: p.price ?? 0,
          vatRate: p.vatRate ?? 0,
          icdCodeIds: p.icdCodeIds ?? [],
          procedureCodeId: p.procedureCodeIds?.[0] ?? '',
          trackSerials: p.trackSerials,
          serialNumbers: p.serialNumbers ?? [],
        },
      ];
    });
  };

  const addFullTest = (template, icdCodeIds) => {
    setErrors((e) => ({ ...e, lines: undefined }));
    setHeader((h) => ({ ...h, icdCodeIds: [...new Set([...h.icdCodeIds, ...icdCodeIds])] }));
    setLines((ls) => [
      ...ls,
      ...template.services.map((s) => ({
        key: `n${++seq.current}`,
        productId: s.productId,
        productName: s.productName,
        type: 'service',
        quantity: 1,
        unitPrice: s.price,
        vatRate: s.vatRate ?? 0,
        icdCodeIds,
        procedureCodeId: s.procedureCodeId ?? '',
        fullTestId: template.id,
        fullTestName: template.name,
      })),
    ]);
  };

  const validate = () => {
    const e = {};
    if (!header.patientId) e.patientId = 'Select a patient or customer.';
    if (!header.branchId) e.branchId = 'Select a branch.';
    if (!header.warehouseId) e.warehouseId = 'Select a warehouse.';
    if (!header.date) e.date = 'Date is required.';
    if (!lines.length) e.lines = 'Add at least one product or service.';
    lines.forEach((l) => {
      if (!(Number(l.quantity) >= 1)) e[`qty-${l.key}`] = 'Min. 1';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (target = header.type) => {
    setSubmitError(null);
    if (!validate()) return;
    setSaving(target);
    try {
      if (invoiceId) {
        await invoicesApi.update(invoiceId, toPayload(header, lines, target === 'invoice' ? initial.header.type : target));
        if (target === 'invoice' && initial.header.type !== 'invoice') await invoicesApi.convertToInvoice(invoiceId);
        toast.success(target === 'invoice' ? 'Converted to invoice' : 'Changes saved');
        navigate(`/invoices/${invoiceId}`);
      } else {
        await invoicesApi.create(toPayload(header, lines, target));
        toast.success(target === 'invoice' ? 'Invoice created' : target === 'proforma' ? 'Pro forma saved' : 'Quote saved');
        navigate('/invoices');
      }
    } catch (err) {
      setSubmitError(err);
    } finally {
      setSaving(null);
    }
  };

  const typeMeta = DOCUMENT_TYPES.find((t) => t.value === header.type) ?? DOCUMENT_TYPES[2];

  return (
    <div className="stack" style={{ gap: 24 }}>
      <div className="document-type-picker" role="radiogroup" aria-label="Document type">
        {DOCUMENT_TYPES.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`document-type-card${header.type === opt.value ? ' is-active' : ''}`}
            aria-pressed={header.type === opt.value}
            onClick={() => set('type', opt.value)}
          >
            <b>{opt.label}</b>
            <span>{opt.hint}</span>
          </button>
        ))}
      </div>
    <div className="grid grid-main-aside" style={{ alignItems: 'start' }}>
      <div className="stack">
        <Card>
          <CardHeader title="Customer & location" />
          <CardBody>
            <div className="form-grid">
              <FormField label="Patient / customer" required error={errors.patientId} className="span-12">
                {({ id }) => (
                  <div className="row" style={{ flexWrap: 'nowrap' }}>
                    <div style={{ flex: 1 }}>
                      <AsyncSelect
                        id={id}
                        resource="patients"
                        value={header.patientId}
                        valueLabel={header.patientName}
                        placeholder="Search by name, ID number or patient number…"
                        getMeta={(p) => p.patientNumber}
                        onChange={(pid, row) => {
                          set('patientId', pid ?? '');
                          set('patientName', row?.fullName ?? row?.name ?? '');
                        }}
                      />
                    </div>
                    <Button icon={UserPlus} to="/patients/new" target="_blank">
                      New
                    </Button>
                  </div>
                )}
              </FormField>
              <FormField label="Branch" required error={errors.branchId}>
                {({ id }) => (
                  <ResourceSelect
                    id={id}
                    resource="branches"
                    params={{ status: 'active' }}
                    value={header.branchId}
                    onChange={(v) => {
                      setHeader((h) => ({ ...h, branchId: v, warehouseId: '' }));
                      setErrors((e) => ({ ...e, branchId: undefined }));
                    }}
                  />
                )}
              </FormField>
              <FormField label="Warehouse" required error={errors.warehouseId} hint="Stock for physical products is taken from this warehouse.">
                {({ id }) => (
                  <Select
                    id={id}
                    options={warehouses.options.filter((o) => o.raw.branchId === header.branchId)}
                    value={header.warehouseId}
                    disabled={!header.branchId || warehouses.loading}
                    placeholder={!header.branchId ? 'Select a branch first' : warehouses.loading ? 'Loading…' : 'Select warehouse'}
                    onChange={(e) => set('warehouseId', e.target.value)}
                  />
                )}
              </FormField>
              <FormField label="Date" required error={errors.date} className="span-4">
                {({ id }) => <DatePicker id={id} value={header.date} onChange={(e) => set('date', e.target.value)} />}
              </FormField>
              <FormField label={header.type === 'quote' ? 'Valid until' : 'Due date'} className="span-4">
                {({ id }) => <DatePicker id={id} value={header.dueDate} onChange={(e) => set('dueDate', e.target.value)} />}
              </FormField>
              <FormField label="Reference" className="span-4">
                {({ id }) => <Input id={id} value={header.reference} onChange={(e) => set('reference', e.target.value)} placeholder="Optional" />}
              </FormField>
            </div>
          </CardBody>
        </Card>

        <Card flush>
          <CardHeader
            title="Items"
            subtitle="Products and services on this document"
            actions={
              <>
                <Button size="sm" icon={ClipboardList} onClick={() => setFullTestOpen(true)}>
                  Add Full Test
                </Button>
                <Button size="sm" variant="primary" icon={Plus} onClick={() => setPickerOpen(true)}>
                  Add product
                </Button>
              </>
            }
          />
          {errors.lines && (
            <div style={{ padding: '12px 20px 0' }}>
              <Alert tone="danger">{errors.lines}</Alert>
            </div>
          )}
          {!lines.length ? (
            <EmptyState
              title="No items yet"
              message="Add standard products, service products or a Full Test."
              action={
                <Button icon={Plus} onClick={() => setPickerOpen(true)}>
                  Add product
                </Button>
              }
            />
          ) : (
            <div className="table-scroll">
              <table className="table table-compact">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th style={{ width: 90 }}>Qty</th>
                    <th style={{ width: 130 }}>Unit price</th>
                    <th>Coding / stock</th>
                    <th className="col-actions" />
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l) => {
                    const avail = l.type === 'standard' ? availabilityFor(l.productId) : null;
                    return (
                      <tr key={l.key}>
                        <td style={{ minWidth: 200 }}>
                          <div className="strong">{l.productName}</div>
                          <div className="row" style={{ marginTop: 4 }}>
                            <StatusBadge domain="productType" value={l.type} dot={false} />
                            {l.fullTestName && <Badge tone="info">{l.fullTestName}</Badge>}
                          </div>
                        </td>
                        <td>
                          <Input
                            size="sm"
                            type="number"
                            min={1}
                            step={1}
                            aria-label={`Quantity for ${l.productName}`}
                            value={l.quantity}
                            onChange={(e) => updateLine(l.key, { quantity: e.target.value })}
                            style={errors[`qty-${l.key}`] ? { borderColor: 'var(--tone-danger-fg)' } : undefined}
                          />
                        </td>
                        <td>
                          <Input
                            size="sm"
                            type="number"
                            min={0}
                            step="0.01"
                            aria-label={`Unit price for ${l.productName}`}
                            value={l.unitPrice}
                            onChange={(e) => updateLine(l.key, { unitPrice: e.target.value })}
                          />
                        </td>
                        <td style={{ minWidth: 260 }}>
                          {l.type === 'service' ? (
                            <div className="stack-sm">
                              <MultiSelect
                                options={icd.options}
                                value={l.icdCodeIds ?? []}
                                onChange={(v) => updateLine(l.key, { icdCodeIds: v })}
                                placeholder="ICD-10 codes"
                              />
                              <Select
                                size="sm"
                                aria-label="Procedure code"
                                options={procedures.options}
                                value={l.procedureCodeId}
                                placeholder="Procedure code"
                                onChange={(e) => updateLine(l.key, { procedureCodeId: e.target.value })}
                              />
                            </div>
                          ) : !header.warehouseId ? (
                            <span className="text-sm muted">Select a warehouse to check stock</span>
                          ) : availability.loading && !avail ? (
                            <span className="row text-sm muted">
                              <Spinner /> Checking stock…
                            </span>
                          ) : availability.error ? (
                            <span className="text-sm text-danger">Unable to check stock</span>
                          ) : avail ? (
                            avail.sufficient ? (
                              <Badge tone="success">
                                <CheckCircle2 size={12} /> {avail.available} available
                              </Badge>
                            ) : (
                              <div className="stack-sm" style={{ gap: 4 }}>
                                <Badge tone="danger">
                                  <AlertTriangle size={12} /> {avail.available} available
                                </Badge>
                                <span className="text-sm text-danger">{avail.message ?? 'Insufficient stock in the selected warehouse.'}</span>
                              </div>
                            )
                          ) : null}
                          {l.type === 'standard' && l.trackSerials && header.warehouseId && (
                            <div style={{ marginTop: 8 }}>
                              <MultiSelect
                                options={serialOptionsFor(l.productId)}
                                value={l.serialNumbers ?? []}
                                onChange={(v) => updateLine(l.key, { serialNumbers: v })}
                                placeholder={serials.loading ? 'Loading serials…' : 'Serial numbers (optional)'}
                              />
                              <div className="field-hint">Leave blank to assign the oldest available serials.</div>
                            </div>
                          )}
                        </td>
                        <td className="col-actions">
                          <Button size="sm" variant="ghost" iconOnly icon={Trash2} aria-label={`Remove ${l.productName}`} onClick={() => removeLine(l.key)} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <CardBody>
            <FormField label="Notes">
              {({ id }) => <Textarea id={id} rows={3} value={header.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Shown on the document" />}
            </FormField>
          </CardBody>
        </Card>
      </div>

      <div className="stack" style={{ position: 'sticky', top: 'calc(var(--header-height) + 16px)' }}>
        <Card>
          <CardHeader title="Summary" />
          <CardBody>
            <div className="stack">
              <FormField label="Diagnosis (ICD-10)" hint="Used for medical aid claims">
                {({ id }) => (
                  <MultiSelect id={id} options={icd.options} loading={icd.loading} value={header.icdCodeIds} onChange={(v) => set('icdCodeIds', v)} placeholder="Search ICD-10 codes…" />
                )}
              </FormField>
              <div>
                <div className="kbd-total">
                  <span className="muted">Subtotal</span>
                  <span>{totals.loading ? '…' : formatCurrency(totals.data?.subtotal ?? 0)}</span>
                </div>
                <div className="kbd-total">
                  <span className="muted">VAT</span>
                  <span>{totals.loading ? '…' : formatCurrency(totals.data?.vat ?? 0)}</span>
                </div>
                <div className="kbd-total grand">
                  <span>Total</span>
                  <span>{totals.loading ? <Spinner /> : formatCurrency(totals.data?.total ?? 0)}</span>
                </div>
                {totals.error && <div className="field-error">Unable to calculate totals.</div>}
              </div>
              {hasStockIssue && header.type === 'invoice' && (
                <Alert tone="warning" title="Stock unavailable">
                  One or more products do not have enough stock in the selected warehouse. A final invoice will be rejected until stock is available. Quotes and pro formas do not reserve stock.
                </Alert>
              )}
              {hasStockIssue && header.type !== 'invoice' && (
                <Alert tone="info" title="Stock unavailable">
                  You can still save this {typeMeta.label.toLowerCase()}; converting to an invoice later will be validated by the server.
                </Alert>
              )}
              {submitError && (
                <Alert tone="danger" title="Could not save">
                  {submitError.message}
                </Alert>
              )}
              <div className="stack-sm">
                <Button variant="primary" icon={header.type === 'invoice' ? FileCheck2 : Save} block loading={Boolean(saving)} disabled={Boolean(saving)} onClick={() => submit(header.type)}>
                  {invoiceId && header.type === 'invoice' ? 'Save & convert to invoice' : `Save ${typeMeta.label.toLowerCase()}`}
                </Button>
                <Button variant="ghost" block onClick={() => navigate('/invoices')} disabled={Boolean(saving)}>
                  ← Invoices
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <ProductPickerModal open={pickerOpen} onClose={() => setPickerOpen(false)} onAdd={addProduct} />
      <FullTestModal open={fullTestOpen} onClose={() => setFullTestOpen(false)} onAdd={addFullTest} />
    </div>
    </div>
  );
}

export function InvoiceEditorPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { user, loading: sessionLoading } = useSession();
  const query = useApiQuery(() => invoicesApi.get(id), [id], { enabled: Boolean(id) });

  if (!id) {
    return (
      <>
        <PageHeader
          eyebrow="New commercial document"
          title="Invoice"
          description="Quotes and pro formas do not reserve stock. A final invoice deducts stock from the selected warehouse."
        />
        {sessionLoading ? <QueryState loading resource="defaults" /> : <InvoiceEditor initial={newEditorState(user, params)} />}
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow="Invoice" title={`Edit ${query.data?.number ?? 'document'}`} />
      <QueryState loading={query.loading} error={query.error} onRetry={query.refetch} resource="invoice">
        {query.data &&
          (query.data.type === 'invoice' ? (
            <Alert tone="warning" title="Final invoices cannot be edited">
              Issue a credit note or refund instead. <Link to={`/invoices/${id}`}>Back to invoice</Link>
            </Alert>
          ) : (
            <InvoiceEditor key={id} initial={fromInvoice(query.data)} invoiceId={id} />
          ))}
      </QueryState>
    </>
  );
}
