import { Check, Plus } from 'lucide-react';
import { useState } from 'react';
import { productsApi } from '../../api';
import { Badge, Button, DataTable, EntityCell, FilterBar, Modal, Pagination, StatusBadge } from '../../components/ui';
import { useListQuery } from '../../hooks/useListQuery';
import { formatCurrency } from '../../utils/format';

/** Server-side product search for adding invoice lines. */
export function ProductPickerModal({ open, onClose, onAdd, type: fixedType }) {
  const list = useListQuery(productsApi.list, {
    filters: { type: fixedType ?? '' },
    baseParams: { status: 'active' },
    pageSize: 8,
    enabled: open,
  });
  const [added, setAdded] = useState({});

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title="Add products"
      description="Search the catalogue. Standard products use warehouse stock; service products do not."
      footer={
        <Button variant="primary" onClick={onClose}>
          Done
        </Button>
      }
    >
      <div className="card card-flush">
        <FilterBar
          list={list}
          searchPlaceholder="Search name, SKU or barcode…"
          filters={fixedType ? [] : [{ key: 'type', label: 'Types', options: 'productType' }]}
        />
        <DataTable
          compact
          resource="products"
          rows={list.items}
          loading={list.loading}
          error={list.error}
          onRetry={list.refetch}
          columns={[
            { key: 'name', header: 'Product', render: (p) => <EntityCell name={p.name} subtitle={p.sku} avatar={false} /> },
            { key: 'type', header: 'Type', render: (p) => <StatusBadge domain="productType" value={p.type} dot={false} /> },
            { key: 'brandName', header: 'Brand / category', render: (p) => p.brandName ?? p.categoryName },
            {
              key: 'stockOnHand',
              header: 'Stock',
              align: 'right',
              render: (p) => (p.type === 'service' ? <Badge>Service</Badge> : p.stockOnHand),
            },
            { key: 'price', header: 'Price', align: 'right', render: (p) => formatCurrency(p.price) },
            {
              key: 'add',
              header: '',
              align: 'right',
              render: (p) => (
                <Button
                  size="sm"
                  variant={added[p.id] ? 'soft' : 'secondary'}
                  icon={added[p.id] ? Check : Plus}
                  onClick={() => {
                    onAdd(p);
                    setAdded((a) => ({ ...a, [p.id]: (a[p.id] ?? 0) + 1 }));
                  }}
                >
                  {added[p.id] ? `Added ×${added[p.id]}` : 'Add'}
                </Button>
              ),
            },
          ]}
        />
        <Pagination page={list.page} pageSize={list.pageSize} total={list.total} onPageChange={list.setPage} />
      </div>
    </Modal>
  );
}
