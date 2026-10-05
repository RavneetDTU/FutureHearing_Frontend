import { AlertTriangle, ArrowDownLeft, ArrowUpRight, Boxes, PackageX, SlidersHorizontal, Wallet } from 'lucide-react';
import { useState } from 'react';
import { stockApi } from '../../api';
import { col } from '../../components/resource/columns';
import {
  Button,
  Card,
  CardHeader,
  DataTable,
  EntityCell,
  FilterBar,
  PageHeader,
  Pagination,
  QueryState,
  StatCard,
  Tabs,
} from '../../components/ui';
import { useSession } from '../../context/SessionContext';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useListQuery } from '../../hooks/useListQuery';
import { formatCurrency, formatDateTime, formatNumber } from '../../utils/format';
import { AdjustQuantityModal } from './AdjustQuantityModal';

function GroupList({ rows = [] }) {
  const max = Math.max(1, ...rows.map((r) => r.units));
  return (
    <ul className="list-plain">
      {rows.map((r) => (
        <li key={r.id} className="list-row" style={{ display: 'block' }}>
          <div className="row-between">
            <span className="strong">{r.name}</span>
            <span className="text-sm muted">
              {formatNumber(r.units)} units · {r.products} lines
              {r.low > 0 && <span className="text-danger"> · {r.low} alerts</span>}
            </span>
          </div>
          <div className="progress" style={{ marginTop: 8 }}>
            <span style={{ width: `${(r.units / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function StockPage() {
  const { branchId } = useSession();
  const [adjusting, setAdjusting] = useState(null);
  const [groupTab, setGroupTab] = useState('branch');
  const summary = useApiQuery(() => stockApi.summary({ branchId }), [branchId]);
  const levels = useListQuery(stockApi.levels, { filters: { branchId: '', warehouseId: '', status: '' } });
  const movements = useListQuery(stockApi.movements, { pageSize: 5, sortBy: 'occurredAt', sortDir: 'desc' });
  const totals = summary.data?.totals ?? {};

  return (
    <div className="stack" style={{ gap: 24 }}>
      <PageHeader
        eyebrow="Inventory"
        title="Stock overview"
        description="Stock quantities are calculated by the backend from purchases, invoices and adjustments."
        actions={
          <Button variant="primary" icon={SlidersHorizontal} onClick={() => setAdjusting({})}>
            Adjust quantity
          </Button>
        }
      />

      <div className="grid grid-4">
        <StatCard label="Total stock" value={formatNumber(totals.totalUnits)} hint="Units on hand" icon={Boxes} loading={summary.loading} />
        <StatCard label="Low stock" value={formatNumber(totals.lowStock)} hint="At or below reorder level" icon={AlertTriangle} tone="warning" loading={summary.loading} />
        <StatCard label="Out of stock" value={formatNumber(totals.outOfStock)} hint="Zero available" icon={PackageX} tone="danger" loading={summary.loading} />
        <StatCard label="Stock value" value={formatCurrency(totals.stockValue)} hint="At cost" icon={Wallet} tone="success" loading={summary.loading} />
      </div>

      <div className="grid grid-main-aside">
        <Card flush>
          <CardHeader title="Stock levels" subtitle="Per product, per warehouse" />
          <FilterBar
            list={levels}
            searchPlaceholder="Search product or SKU…"
            filters={[
              { key: 'branchId', label: 'Branches', options: { resource: 'branches' } },
              { key: 'warehouseId', label: 'Warehouses', options: { resource: 'warehouses', dependsOn: 'branchId' } },
              { key: 'status', label: 'Stock statuses', options: { status: 'stock' } },
            ]}
          />
          <DataTable
            resource="stock levels"
            rows={levels.items}
            loading={levels.loading}
            error={levels.error}
            onRetry={levels.refetch}
            sort={levels.sort}
            onSort={levels.toggleSort}
            columns={[
              { key: 'productName', header: 'Product', sortable: true, render: (r) => <EntityCell name={r.productName} subtitle={r.sku} avatar={false} /> },
              { key: 'warehouseName', header: 'Location', render: (r) => <div>{r.warehouseName}<div className="entity-sub">{r.branchName}</div></div> },
              col.text('onHand', 'On hand', { align: 'right' }),
              col.text('reserved', 'Reserved', { align: 'right' }),
              { key: 'available', header: 'Available', align: 'right', sortable: true, render: (r) => <strong>{formatNumber(r.available)}</strong> },
              col.status('stock'),
            ]}
            rowActions={(r) => [
              { label: 'Adjust quantity', icon: SlidersHorizontal, onClick: () => setAdjusting(r) },
              { label: 'View product', to: `/products/${r.productId}` },
            ]}
          />
          <Pagination page={levels.page} pageSize={levels.pageSize} total={levels.total} onPageChange={levels.setPage} onPageSizeChange={levels.setPageSize} />
        </Card>

        <Card flush>
          <CardHeader title={groupTab === 'branch' ? 'Stock by branch' : 'Stock by warehouse'} />
          <div style={{ padding: '12px 20px 0' }}>
            <Tabs
              variant="pills"
              value={groupTab}
              onChange={setGroupTab}
              tabs={[
                { key: 'branch', label: 'By branch' },
                { key: 'warehouse', label: 'By warehouse' },
              ]}
            />
          </div>
          <QueryState loading={summary.loading} error={summary.error} onRetry={summary.refetch} resource="stock summary" compact isEmpty={!summary.data?.byBranch?.length}>
            <GroupList rows={groupTab === 'branch' ? summary.data?.byBranch : summary.data?.byWarehouse} />
          </QueryState>
        </Card>
      </div>

      <Card flush>
        <CardHeader title="Recent stock movements" />
        <DataTable
          compact
          resource="stock movements"
          rows={movements.items}
          loading={movements.loading}
          error={movements.error}
          onRetry={movements.refetch}
          columns={[
            {
              key: 'direction',
              header: '',
              width: 40,
              render: (r) =>
                r.direction === 'in' ? (
                  <ArrowDownLeft size={18} color="var(--tone-success-fg)" aria-label="Stock in" />
                ) : (
                  <ArrowUpRight size={18} color="var(--tone-danger-fg)" aria-label="Stock out" />
                ),
            },
            { key: 'productName', header: 'Product', render: (r) => <strong>{r.productName}</strong> },
            { key: 'quantity', header: 'Qty', align: 'right', render: (r) => `${r.direction === 'in' ? '+' : '−'}${r.quantity}` },
            { key: 'warehouseName', header: 'Location', render: (r) => `${r.branchName} · ${r.warehouseName}` },
            { key: 'reason', header: 'Reason' },
            { key: 'reference', header: 'Reference', render: (r) => <span className="mono">{r.reference}</span> },
            { key: 'userName', header: 'User' },
            { key: 'occurredAt', header: 'Date', render: (r) => <span className="nowrap">{formatDateTime(r.occurredAt)}</span> },
          ]}
        />
        <Pagination page={movements.page} pageSize={movements.pageSize} total={movements.total} onPageChange={movements.setPage} />
      </Card>

      <AdjustQuantityModal
        open={Boolean(adjusting)}
        onClose={() => setAdjusting(null)}
        product={adjusting?.productId ? { id: adjusting.productId, name: adjusting.productName } : null}
        defaults={adjusting?.branchId ? { branchId: adjusting.branchId, warehouseId: adjusting.warehouseId } : {}}
        onDone={() => {
          summary.refetch();
          levels.refetch();
          movements.refetch();
        }}
      />
    </div>
  );
}
