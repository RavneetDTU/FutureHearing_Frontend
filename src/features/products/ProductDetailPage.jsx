import { Pencil, Printer, SlidersHorizontal, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productsApi, stockApi } from '../../api';
import {
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
} from '../../components/ui';
import { useSession } from '../../context/SessionContext';
import { useToast } from '../../context/ToastContext';
import { canSeePrices } from '../../utils/access';
import { useApiQuery } from '../../hooks/useApiQuery';
import { barcodeToSvg, barcodeValue, isValidBarcodeValue } from '../../utils/barcode';
import { formatCurrency, formatNumber } from '../../utils/format';
import { AdjustQuantityModal } from '../inventory/AdjustQuantityModal';
import { ProductBarcode } from './ProductBarcode';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function printWindow() {
  const popup = window.open('', '_blank', 'width=420,height=640');
  if (popup) return popup;

  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
  document.body.appendChild(iframe);
  iframe.contentWindow?.addEventListener('afterprint', () => iframe.remove());
  setTimeout(() => iframe.remove(), 60_000);
  return iframe.contentWindow;
}

function printLabel(product) {
  const code = barcodeValue(product);
  if (!code || !isValidBarcodeValue(code)) {
    throw new Error('This code cannot be printed as a barcode.');
  }
  let svg = '';
  try {
    svg = barcodeToSvg(code, { height: 48, width: 1.6 });
  } catch {
    svg = '';
  }
  if (!svg) {
    throw new Error('This code cannot be printed as a barcode.');
  }

  const name = escapeHtml(product.name);
  const sku = escapeHtml(product.sku || code);
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${sku}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; background: #fff; text-align: center; padding: 24px; }
    h1 { font-size: 18px; margin-bottom: 16px; }
    .barcode { margin: 16px 0; display: flex; justify-content: center; }
    .barcode svg { max-width: 100%; height: auto; }
    .code { font-family: ui-monospace, monospace; letter-spacing: 0.08em; margin-top: 8px; }
    .sku { margin-top: 8px; color: #444; }
  </style>
</head>
<body>
  <h1>${name}</h1>
  <div class="barcode">${svg}</div>
  <p class="code">${escapeHtml(code)}</p>
  <p class="sku">SKU ${sku}</p>
</body>
</html>`;

  const target = printWindow();
  if (!target?.document) {
    throw new Error('Pop-up blocked. Allow pop-ups to print barcodes.');
  }

  target.document.open();
  target.document.write(html);
  target.document.close();
  target.focus();
  setTimeout(() => target.print(), 250);
}

function StockByWarehouse({ productId }) {
  const q = useApiQuery(() => stockApi.levels({ productId, pageSize: 50 }), [productId]);
  return (
    <Card flush>
      <CardHeader title="Stock by warehouse" subtitle="Provided by the stock service" />
      <DataTable
        compact
        resource="stock levels"
        loading={q.loading}
        error={q.error}
        onRetry={q.refetch}
        rows={q.data?.items ?? []}
        columns={[
          { key: 'branchName', header: 'Branch' },
          { key: 'warehouseName', header: 'Warehouse' },
          { key: 'onHand', header: 'On hand', align: 'right' },
          { key: 'reserved', header: 'Reserved', align: 'right' },
          { key: 'available', header: 'Available', align: 'right', render: (r) => <strong>{formatNumber(r.available)}</strong> },
          { key: 'status', header: 'Status', render: (r) => <StatusBadge domain="stock" value={r.status} /> },
        ]}
      />
    </Card>
  );
}

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { can, user } = useSession();
  const seePrices = canSeePrices(user);
  const { data: p, loading, error, refetch } = useApiQuery(() => productsApi.get(id), [id]);
  const [adjusting, setAdjusting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const remove = async () => {
    setDeleteLoading(true);
    try {
      await productsApi.remove(id);
      toast.success('Product deleted');
      navigate('/products');
    } catch (err) {
      toast.error('Unable to delete product', err.message);
      setDeleteLoading(false);
    }
  };

  return (
    <QueryState loading={loading} error={error} onRetry={refetch} resource="product">
      {p && (
        <>
          <PageHeader
            eyebrow={p.type === 'service' ? 'Service product' : 'Standard product'}
            title={p.name}
            actions={
              <>
                {p.type === 'standard' && (p.barcode || p.sku) && (
                  <Button
                    icon={Printer}
                    onClick={() => {
                      try {
                        printLabel(p);
                      } catch (err) {
                        toast.error('Unable to print barcode', err.message);
                      }
                    }}
                  >
                    Print barcode
                  </Button>
                )}
                {p.type === 'standard' && can('products.edit') && (
                  <Button icon={SlidersHorizontal} onClick={() => setAdjusting(true)}>
                    Adjust quantity
                  </Button>
                )}
                {can('products.delete') && (
                  <Button icon={Trash2} onClick={() => setDeleting(true)}>
                    Delete
                  </Button>
                )}
                {can('products.edit') && (
                  <Button variant="primary" icon={Pencil} to={`/products/${p.id}/edit`}>
                    Edit product
                  </Button>
                )}
              </>
            }
          >
            <div className="row" style={{ marginTop: 10 }}>
              <StatusBadge domain="productType" value={p.type} dot={false} />
              <StatusBadge value={p.status} />
              {p.sku && <Badge>{p.sku}</Badge>}
            </div>
          </PageHeader>

          <div className="grid grid-main-aside">
            <div className="stack">
              <Card>
                <CardHeader title="Details" />
                <CardBody>
                  <DetailList
                    items={[
                      { label: 'Company', value: p.companyName, hidden: p.type === 'service' },
                      { label: 'Brand', value: p.brandName, hidden: p.type === 'service' },
                      { label: 'Model', value: p.modelName, hidden: p.type === 'service' },
                      { label: 'Category', value: p.categoryName },
                      { label: 'Subcategory', value: p.subcategoryName },
                      { label: p.type === 'service' ? 'Service code' : 'SKU', value: p.sku },
                      { label: 'Duration', value: p.durationMinutes && `${p.durationMinutes} min`, hidden: p.type !== 'service' },
                      { label: 'Serial tracking', value: p.trackSerials ? 'Each unit tracked' : 'Not tracked', hidden: p.type === 'service' },
                      { label: 'Description', value: p.description },
                    ]}
                  />
                </CardBody>
              </Card>
              {p.type === 'standard' ? (
                <StockByWarehouse productId={p.id} />
              ) : (
                <Card>
                  <CardHeader title="Medical coding" subtitle="Default codes suggested on invoices and claims" />
                  <CardBody>
                    <DetailList
                      items={[
                        { label: 'ICD-10 codes', value: p.icdCodes },
                        { label: 'Procedure codes', value: p.procedureCodes },
                      ]}
                    />
                  </CardBody>
                </Card>
              )}
            </div>
            <Card>
              <CardHeader title="Pricing" />
              <CardBody>
                <DetailList
                  columns={1}
                  items={[
                    { label: 'Selling price', value: <span className="stat-value" style={{ fontSize: 22 }}>{formatCurrency(p.price)}</span>, hidden: !seePrices },
                    { label: 'Cost price', value: formatCurrency(p.cost), hidden: p.type === 'service' || !seePrices },
                    { label: 'VAT rate', value: p.vatRate !== undefined && p.vatRate !== null ? `${p.vatRate}%` : null },
                    { label: 'Stock on hand (all warehouses)', value: formatNumber(p.stockOnHand), hidden: p.type === 'service' },
                    { label: 'Reorder level', value: formatNumber(p.reorderLevel), hidden: p.type === 'service' },
                  ]}
                />
                <ProductBarcode product={p} />
              </CardBody>
            </Card>
          </div>

          <AdjustQuantityModal open={adjusting} product={p} onClose={() => setAdjusting(false)} onDone={refetch} />
          <ConfirmDialog
            open={deleting}
            onClose={() => setDeleting(false)}
            onConfirm={remove}
            loading={deleteLoading}
            title="Delete product?"
            message={`"${p.name}" will be removed from the catalogue. Existing invoices are not affected.`}
            confirmLabel="Delete product"
          />
        </>
      )}
    </QueryState>
  );
}
