import { Boxes, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { col, statusFilter } from '../../components/resource/columns';
import { ResourceListPage } from '../../components/resource/ResourceListPage';
import { Badge, Button, EntityCell, StatusBadge } from '../../components/ui';
import { AdjustQuantityModal } from '../inventory/AdjustQuantityModal';
import { formatNumber } from '../../utils/format';

export function ProductsListPage() {
  const [adjusting, setAdjusting] = useState(null);

  const config = {
    resource: 'products',
    title: 'Products',
    singular: 'Product',
    eyebrow: 'Catalogue',
    description: 'Standard products are physical stock items. Service products are time-based services such as hearing tests.',
    permissions: { create: 'products.create', edit: 'products.edit', delete: 'products.delete' },
    createPath: '/products/new',
    editPath: (r) => `/products/${r.id}/edit`,
    detailPath: (r) => `/products/${r.id}`,
    searchPlaceholder: 'Search name, SKU or barcode…',
    columns: [
      { key: 'name', header: 'Product', sortable: true, render: (r) => <EntityCell name={r.name} subtitle={r.sku} avatar={false} /> },
      { key: 'type', header: 'Type', sortable: true, render: (r) => <StatusBadge domain="productType" value={r.type} dot={false} /> },
      {
        key: 'brandName',
        header: 'Company / Brand / Model',
        render: (r) =>
          r.type === 'service' ? (
            <span className="subtle">Not applicable</span>
          ) : (
            <div>
              <div>{r.brandName}</div>
              <div className="entity-sub">
                {r.companyName}
                {r.modelName && ` · ${r.modelName}`}
              </div>
            </div>
          ),
      },
      { key: 'categoryName', header: 'Category', sortable: true, render: (r) => <div>{r.categoryName}<div className="entity-sub">{r.subcategoryName}</div></div> },
      col.currency('price', 'Price'),
      {
        key: 'stockOnHand',
        header: 'Stock',
        align: 'right',
        sortable: true,
        render: (r) =>
          r.type === 'service' ? (
            <Badge tone="neutral">No stock</Badge>
          ) : (
            <span className={r.stockOnHand <= (r.reorderLevel ?? 0) ? 'strong text-danger' : 'strong'}>{formatNumber(r.stockOnHand)}</span>
          ),
      },
      col.status(),
    ],
    filters: [
      { key: 'type', label: 'Types', options: 'productType' },
      { key: 'companyId', label: 'Companies', options: { resource: 'companies' } },
      { key: 'brandId', label: 'Brands', options: { resource: 'brands', dependsOn: 'companyId' } },
      { key: 'modelId', label: 'Models', options: { resource: 'models', dependsOn: 'brandId' } },
      { key: 'categoryId', label: 'Categories', options: { resource: 'categories' } },
      { key: 'subcategoryId', label: 'Subcategories', options: { resource: 'subcategories', dependsOn: 'categoryId' } },
      statusFilter(),
    ],
    rowExtraActions: (row) => [
      {
        label: 'Adjust quantity',
        icon: SlidersHorizontal,
        hidden: row.type === 'service',
        onClick: () => setAdjusting(row),
      },
    ],
    headerActions: (
      <>
        <Button icon={Boxes} to="/stock">
          Stock overview
        </Button>
        <Button icon={SlidersHorizontal} onClick={() => setAdjusting({})}>
          Adjust quantity
        </Button>
      </>
    ),
  };

  return (
    <>
      <ResourceListPage config={config} />
      <AdjustQuantityModal
        open={Boolean(adjusting)}
        product={adjusting?.id ? adjusting : null}
        onClose={() => setAdjusting(null)}
      />
    </>
  );
}
