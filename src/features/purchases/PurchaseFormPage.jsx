import { PackageCheck, Plus, Save, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { purchasesApi } from '../../api';
import {
  Alert,
  AsyncSelect,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CurrencyInput,
  DatePicker,
  EmptyState,
  FormField,
  Input,
  PageHeader,
  QueryState,
  ResourceSelect,
  Textarea,
} from '../../components/ui';
import { useToast } from '../../context/ToastContext';
import { useApiQuery } from '../../hooks/useApiQuery';
import { SerialNumberInputs } from './SerialNumberInputs';

const emptyPurchase = () => ({
  header: {
    supplierId: '',
    branchId: '',
    warehouseId: '',
    date: new Date().toISOString().slice(0, 10),
    supplierReference: '',
    patientId: '',
    patientName: '',
    notes: '',
  },
  lines: [],
});

const fromPurchase = (p) => ({
  header: {
    supplierId: p.supplierId,
    branchId: p.branchId,
    warehouseId: p.warehouseId,
    date: p.date,
    supplierReference: p.supplierReference ?? '',
    patientId: p.patientId ?? '',
    patientName: p.patientName ?? '',
    notes: p.notes ?? '',
  },
  lines: (p.lines ?? []).map((l, i) => ({ ...l, key: `l${i}` })),
});

function PurchaseForm({ initial, purchaseId }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [header, setHeader] = useState(initial.header);
  const [lines, setLines] = useState(initial.lines);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [saving, setSaving] = useState(null);
  const [requireSerials, setRequireSerials] = useState(false);
  const seq = useRef(initial.lines.length);

  const set = (key, value) => {
    setHeader((h) => ({ ...h, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };
  const updateLine = (key, patch) => setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  const addProduct = (id, p) => {
    if (!p) return;
    setErrors((e) => ({ ...e, lines: undefined }));
    setLines((ls) => [
      ...ls,
      { key: `n${++seq.current}`, productId: id, productName: p.name, sku: p.sku, trackSerials: Boolean(p.trackSerials), quantity: 1, unitCost: p.cost ?? '', serialNumbers: [] },
    ]);
  };

  const validate = (completing) => {
    const e = {};
    if (!header.supplierId) e.supplierId = 'Select a supplier.';
    if (!header.branchId) e.branchId = 'Select a branch.';
    if (!header.warehouseId) e.warehouseId = 'Select the receiving warehouse.';
    if (!header.date) e.date = 'Date is required.';
    if (!lines.length) e.lines = 'Add at least one product.';
    lines.forEach((l) => {
      if (!(Number(l.quantity) >= 1)) e[`qty-${l.key}`] = 'Min. 1';
      if (completing && l.trackSerials) {
        const filled = (l.serialNumbers ?? []).slice(0, Number(l.quantity)).filter(Boolean).length;
        if (filled < Number(l.quantity)) e[`serial-${l.key}`] = `${Number(l.quantity) - filled} serial number(s) missing.`;
      }
    });
    setErrors(e);
    setRequireSerials(completing);
    return Object.keys(e).length === 0;
  };

  const submit = async (complete) => {
    setSubmitError(null);
    if (!validate(complete)) return;
    setSaving(complete ? 'complete' : 'draft');
    const payload = {
      supplierId: header.supplierId,
      branchId: header.branchId,
      warehouseId: header.warehouseId,
      date: header.date || null,
      supplierReference: header.supplierReference || null,
      patientId: header.patientId || null,
      notes: header.notes || null,
      status: 'draft',
      lines: lines.map((l) => ({
        productId: l.productId,
        quantity: Number(l.quantity),
        unitCost: l.unitCost === '' ? null : Number(l.unitCost),
        serialNumbers: l.trackSerials ? (l.serialNumbers ?? []).slice(0, Number(l.quantity)) : [],
      })),
    };
    try {
      const saved = purchaseId ? await purchasesApi.update(purchaseId, payload) : await purchasesApi.create(payload);
      const id = purchaseId ?? saved?.id;
      if (complete) await purchasesApi.complete(id);
      toast.success(complete ? 'Purchase received' : 'Purchase saved', complete ? 'Stock will be booked into the selected warehouse.' : undefined);
      navigate(purchaseId ? `/purchases/${purchaseId}` : '/purchases');
    } catch (err) {
      setSubmitError(err);
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="stack">
      <Card>
        <CardHeader title="Purchase details" />
        <CardBody>
          <div className="form-grid">
            <FormField label="Supplier" required error={errors.supplierId}>
              {({ id }) => <ResourceSelect id={id} resource="suppliers" params={{ status: 'active' }} value={header.supplierId} onChange={(v) => set('supplierId', v)} />}
            </FormField>
            <FormField label="Supplier reference / invoice no." className="span-6">
              {({ id }) => <Input id={id} value={header.supplierReference} onChange={(e) => set('supplierReference', e.target.value)} />}
            </FormField>
            <FormField label="Receiving branch" required error={errors.branchId} className="span-4">
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
            <FormField label="Warehouse" required error={errors.warehouseId} className="span-4">
              {({ id }) => (
                <ResourceSelect
                  id={id}
                  resource="warehouses"
                  params={{ branchId: header.branchId }}
                  disabledReason={!header.branchId ? 'Select a branch first' : null}
                  value={header.warehouseId}
                  onChange={(v) => set('warehouseId', v)}
                />
              )}
            </FormField>
            <FormField label="Date received" required error={errors.date} className="span-4">
              {({ id }) => <DatePicker id={id} value={header.date} onChange={(e) => set('date', e.target.value)} />}
            </FormField>
            <FormField label="Allocate to patient" hint="Optional. Allocated purchases appear in the patient's purchase history." className="span-12">
              {({ id }) => (
                <AsyncSelect
                  id={id}
                  resource="patients"
                  value={header.patientId}
                  valueLabel={header.patientName}
                  placeholder="Search patients (optional)…"
                  getMeta={(p) => p.patientNumber}
                  onChange={(pid, row) => setHeader((h) => ({ ...h, patientId: pid ?? '', patientName: row?.fullName ?? '' }))}
                />
              )}
            </FormField>
          </div>
        </CardBody>
      </Card>

      <Card flush>
        <CardHeader title="Products received" subtitle="Capture each unit's serial number for serial-tracked products" />
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)' }}>
          <FormField label="Add product">
            {({ id }) => (
              <AsyncSelect
                id={id}
                resource="products"
                params={{ type: 'standard', status: 'active' }}
                value={null}
                clearable={false}
                placeholder="Search standard products to add…"
                getMeta={(p) => p.sku}
                onChange={addProduct}
              />
            )}
          </FormField>
          {errors.lines && <div className="field-error" style={{ marginTop: 6 }}>{errors.lines}</div>}
        </div>
        {!lines.length ? (
          <EmptyState compact icon={Plus} title="No products added" message="Search above to add the products you received." />
        ) : (
          <ul className="list-plain">
            {lines.map((l) => (
              <li key={l.key} style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)' }}>
                <div className="row-between" style={{ alignItems: 'flex-start' }}>
                  <div>
                    <div className="strong">{l.productName}</div>
                    <div className="row" style={{ marginTop: 4 }}>
                      {l.sku && <span className="text-sm muted mono">{l.sku}</span>}
                      {l.trackSerials ? <Badge tone="brand">Serial tracked</Badge> : <Badge>No serials</Badge>}
                    </div>
                  </div>
                  <div className="row" style={{ flexWrap: 'nowrap', alignItems: 'flex-end' }}>
                    <FormField label="Quantity" error={errors[`qty-${l.key}`]}>
                      {({ id }) => (
                        <Input id={id} size="sm" type="number" min={1} step={1} style={{ width: 90 }} value={l.quantity} onChange={(e) => updateLine(l.key, { quantity: e.target.value })} />
                      )}
                    </FormField>
                    <FormField label="Unit cost">
                      {({ id }) => <div style={{ width: 140 }}><CurrencyInput id={id} className="has-addon input-sm" value={l.unitCost} onChange={(e) => updateLine(l.key, { unitCost: e.target.value })} /></div>}
                    </FormField>
                    <Button size="sm" variant="ghost" iconOnly icon={Trash2} aria-label={`Remove ${l.productName}`} onClick={() => setLines((ls) => ls.filter((x) => x.key !== l.key))} />
                  </div>
                </div>
                {l.trackSerials && (
                  <div style={{ marginTop: 12 }}>
                    <SerialNumberInputs
                      quantity={l.quantity}
                      value={l.serialNumbers}
                      productName={l.productName}
                      showErrors={requireSerials}
                      onChange={(serialNumbers) => updateLine(l.key, { serialNumbers })}
                    />
                    {errors[`serial-${l.key}`] && <div className="field-error" style={{ marginTop: 6 }}>{errors[`serial-${l.key}`]}</div>}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardBody>
          <FormField label="Notes">
            {({ id }) => <Textarea id={id} rows={3} value={header.notes} onChange={(e) => set('notes', e.target.value)} />}
          </FormField>
        </CardBody>
      </Card>

      {submitError && (
        <Alert tone="danger" title="Could not save purchase">
          {submitError.message}
        </Alert>
      )}
      <div className="form-actions">
        <Button onClick={() => navigate(-1)} disabled={Boolean(saving)}>
          Cancel
        </Button>
        <Button icon={Save} loading={saving === 'draft'} disabled={Boolean(saving)} onClick={() => submit(false)}>
          Save as draft
        </Button>
        <Button variant="primary" icon={PackageCheck} loading={saving === 'complete'} disabled={Boolean(saving)} onClick={() => submit(true)}>
          Mark as received
        </Button>
      </div>
    </div>
  );
}

export function PurchaseFormPage() {
  const { id } = useParams();
  const q = useApiQuery(() => purchasesApi.get(id), [id], { enabled: Boolean(id) });
  return (
    <>
      <PageHeader
        eyebrow="Inventory"
        title={id ? `Edit ${q.data?.number ?? 'purchase'}` : 'Add purchase'}
        description="Record stock that has physically arrived at the branch."
      />
      {id ? (
        <QueryState loading={q.loading} error={q.error} onRetry={q.refetch} resource="purchase">
          {q.data &&
            (q.data.status === 'completed' ? (
              <Alert tone="warning" title="Received purchases cannot be edited">
                Stock has already been booked. Use Adjust Quantity for corrections. <Link to={`/purchases/${id}`}>Back to purchase</Link>
              </Alert>
            ) : (
              <PurchaseForm key={id} initial={fromPurchase(q.data)} purchaseId={id} />
            ))}
        </QueryState>
      ) : (
        <PurchaseForm initial={emptyPurchase()} />
      )}
    </>
  );
}
