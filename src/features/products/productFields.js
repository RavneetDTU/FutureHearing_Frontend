import { statusField } from '../../components/resource/columns';

/** Field definitions per product type. Field names are UI-side; map to backend names in `toProductPayload`. */
export function getProductFields(type) {
  const isService = type === 'service';
  const common = {
    category: { name: 'categoryId', label: isService ? 'Service category' : 'Category', type: 'select', required: true, options: { resource: 'categories' } },
    subcategory: {
      name: 'subcategoryId',
      label: isService ? 'Service subcategory' : 'Subcategory',
      type: 'select',
      options: { resource: 'subcategories', dependsOn: 'categoryId' },
      dependsOnMessage: 'Select a category first',
    },
  };

  if (isService) {
    return [
      { name: 'h-basic', type: 'heading', label: 'Service details' },
      { name: 'name', label: 'Service name', required: true, span: 8 },
      { name: 'sku', label: 'Service code', span: 4 },
      common.category,
      common.subcategory,
      { name: 'durationMinutes', label: 'Duration (minutes)', type: 'number', min: 0, step: 5 },
      statusField(),
      { name: 'description', label: 'Description', type: 'textarea', span: 12 },
      { name: 'h-pricing', type: 'heading', label: 'Pricing' },
      { name: 'price', label: 'Price', type: 'currency', required: true, min: 0 },
      { name: 'vatRate', label: 'VAT rate (%)', type: 'number', min: 0, max: 100 },
      { name: 'h-codes', type: 'heading', label: 'Medical coding', hint: 'Default codes suggested when this service is added to an invoice or claim.' },
      { name: 'icdCodeIds', label: 'ICD-10 codes', type: 'multiselect', options: { resource: 'icdCodes' }, span: 12 },
      { name: 'procedureCodeIds', label: 'Procedure codes', type: 'multiselect', options: { resource: 'procedureCodes' }, span: 12 },
    ];
  }

  return [
    { name: 'h-basic', type: 'heading', label: 'Product details' },
    { name: 'name', label: 'Product name', required: true, span: 12 },
    { name: 'companyId', label: 'Company', type: 'select', required: true, options: { resource: 'companies' }, span: 4, hint: 'Manufacturer' },
    { name: 'brandId', label: 'Brand', type: 'select', required: true, options: { resource: 'brands', dependsOn: 'companyId' }, dependsOnMessage: 'Select a company first', span: 4 },
    { name: 'modelId', label: 'Model', type: 'select', options: { resource: 'models', dependsOn: 'brandId' }, dependsOnMessage: 'Select a brand first', span: 4 },
    common.category,
    common.subcategory,
    { name: 'sku', label: 'SKU / product code', required: true },
    { name: 'barcode', label: 'Barcode' },
    { name: 'description', label: 'Description', type: 'textarea', span: 12 },
    { name: 'h-pricing', type: 'heading', label: 'Pricing' },
    { name: 'price', label: 'Selling price', type: 'currency', required: true, min: 0, span: 4 },
    { name: 'cost', label: 'Cost price', type: 'currency', min: 0, span: 4 },
    { name: 'vatRate', label: 'VAT rate (%)', type: 'number', min: 0, max: 100, span: 4 },
    { name: 'h-stock', type: 'heading', label: 'Stock', hint: 'Stock on hand is maintained by the backend from purchases, invoices and adjustments.' },
    { name: 'reorderLevel', label: 'Reorder level', type: 'number', min: 0, step: 1, hint: 'Flag as low stock at or below this quantity' },
    statusField(),
    { name: 'trackSerials', label: 'Serial numbers', type: 'switch', switchLabel: 'Track individual serial numbers for each unit', span: 12 },
  ];
}

export const emptyProduct = (type = 'standard') => ({
  type,
  status: 'active',
  vatRate: type === 'service' ? 0 : 15,
  trackSerials: type === 'standard',
  icdCodeIds: [],
  procedureCodeIds: [],
});

export function toProductPayload(values) {
  const base = {
    type: values.type,
    name: values.name,
    sku: values.sku,
    categoryId: values.categoryId || null,
    subcategoryId: values.subcategoryId || null,
    price: values.price === '' ? null : Number(values.price),
    vatRate: values.vatRate === '' || values.vatRate === undefined ? null : Number(values.vatRate),
    description: values.description,
    status: values.status,
  };
  if (values.type === 'service') {
    return {
      ...base,
      durationMinutes: values.durationMinutes ? Number(values.durationMinutes) : null,
      icdCodeIds: values.icdCodeIds ?? [],
      procedureCodeIds: values.procedureCodeIds ?? [],
    };
  }
  return {
    ...base,
    companyId: values.companyId,
    brandId: values.brandId,
    modelId: values.modelId || null,
    barcode: values.barcode,
    cost: values.cost === '' || values.cost === undefined ? null : Number(values.cost),
    reorderLevel: values.reorderLevel === '' || values.reorderLevel === undefined ? null : Number(values.reorderLevel),
    trackSerials: Boolean(values.trackSerials),
  };
}
