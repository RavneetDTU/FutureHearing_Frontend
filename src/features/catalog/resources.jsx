import { col, statusField, statusFilter } from '../../components/resource/columns';
import { StatusBadge } from '../../components/ui';
import { optionLabel } from '../../config/statuses';

const companyField = { name: 'companyId', label: 'Company', type: 'select', required: true, options: { resource: 'companies' }, hint: 'The manufacturer of the product range.' };

export const companiesConfig = {
  resource: 'companies',
  title: 'Companies',
  singular: 'Company',
  eyebrow: 'Products',
  description: 'Manufacturers that make the products you sell. Companies own brands, brands own models.',
  permissions: { create: 'products.create', edit: 'products.edit', delete: 'products.delete' },
  columns: [
    col.entity('name', 'Company', 'country'),
    col.text('brandCount', 'Brands', { align: 'right' }),
    col.text('email', 'Email'),
    col.text('phone', 'Telephone'),
    col.status(),
  ],
  filters: [statusFilter()],
  fields: [
    { name: 'name', label: 'Company name', required: true, span: 12 },
    { name: 'country', label: 'Country' },
    { name: 'website', label: 'Website', type: 'url', placeholder: 'https://' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'phone', label: 'Telephone', type: 'tel' },
    { name: 'notes', label: 'Notes', type: 'textarea', span: 12 },
    statusField(),
  ],
  viewItems: (r) => [
    { label: 'Country', value: r.country },
    { label: 'Website', value: r.website && <a href={r.website} target="_blank" rel="noreferrer">{r.website}</a> },
    { label: 'Email', value: r.email },
    { label: 'Telephone', value: r.phone },
    { label: 'Brands', value: r.brandCount },
    { label: 'Status', value: <StatusBadge value={r.status} /> },
  ],
};

export const brandsConfig = {
  resource: 'brands',
  title: 'Brands',
  singular: 'Brand',
  eyebrow: 'Products',
  description: 'Brands belong to a company. Structure: Company → Brand → Model.',
  permissions: companiesConfig.permissions,
  columns: [col.strong('name', 'Brand'), col.text('companyName', 'Company'), col.text('modelCount', 'Models', { align: 'right' }), col.status()],
  filters: [{ key: 'companyId', label: 'Companies', options: { resource: 'companies' } }, statusFilter()],
  fields: [{ name: 'name', label: 'Brand name', required: true }, companyField, { name: 'description', label: 'Description', type: 'textarea', span: 12 }, statusField()],
  formSize: 'md',
  viewItems: (r) => [
    { label: 'Company', value: r.companyName },
    { label: 'Models', value: r.modelCount },
    { label: 'Status', value: <StatusBadge value={r.status} /> },
  ],
};

export const modelsConfig = {
  resource: 'models',
  title: 'Models',
  singular: 'Model',
  eyebrow: 'Products',
  description: 'Models belong to a brand. Choose the company first to narrow the brand list.',
  permissions: companiesConfig.permissions,
  columns: [col.strong('name', 'Model'), col.text('brandName', 'Brand'), col.text('companyName', 'Company'), col.status()],
  filters: [
    { key: 'companyId', label: 'Companies', options: { resource: 'companies' } },
    { key: 'brandId', label: 'Brands', options: { resource: 'brands', dependsOn: 'companyId' } },
    statusFilter(),
  ],
  fields: [
    { name: 'name', label: 'Model name', required: true, span: 12 },
    { ...companyField, hint: undefined },
    { name: 'brandId', label: 'Brand', type: 'select', required: true, options: { resource: 'brands', dependsOn: 'companyId' }, dependsOnMessage: 'Select a company first' },
    { name: 'description', label: 'Description', type: 'textarea', span: 12 },
    statusField(),
  ],
  formSize: 'md',
  viewItems: (r) => [
    { label: 'Brand', value: r.brandName },
    { label: 'Company', value: r.companyName },
    { label: 'Status', value: <StatusBadge value={r.status} /> },
  ],
};

export const categoriesConfig = {
  resource: 'categories',
  title: 'Categories',
  singular: 'Category',
  eyebrow: 'Products',
  description: 'Top-level product and service groupings.',
  permissions: companiesConfig.permissions,
  columns: [
    col.strong('name', 'Category'),
    { key: 'appliesTo', header: 'Applies to', render: (r) => optionLabel('categoryAppliesTo', r.appliesTo) },
    col.text('subcategoryCount', 'Subcategories', { align: 'right' }),
    col.text('description', 'Description', { sortable: false }),
    col.status(),
  ],
  filters: [{ key: 'appliesTo', label: 'Types', options: 'categoryAppliesTo' }, statusFilter()],
  fields: [
    { name: 'name', label: 'Category name', required: true },
    { name: 'appliesTo', label: 'Applies to', type: 'select', required: true, options: 'categoryAppliesTo' },
    { name: 'description', label: 'Description', type: 'textarea', span: 12 },
    statusField(),
  ],
  defaultValues: { appliesTo: 'standard' },
  formSize: 'md',
  viewItems: (r) => [
    { label: 'Applies to', value: optionLabel('categoryAppliesTo', r.appliesTo) },
    { label: 'Subcategories', value: r.subcategoryCount },
    { label: 'Description', value: r.description },
    { label: 'Status', value: <StatusBadge value={r.status} /> },
  ],
};

export const subcategoriesConfig = {
  resource: 'subcategories',
  title: 'Subcategories',
  singular: 'Subcategory',
  eyebrow: 'Products',
  description: 'Subcategories belong to a category.',
  permissions: companiesConfig.permissions,
  columns: [col.strong('name', 'Subcategory'), col.text('categoryName', 'Category'), col.status()],
  filters: [{ key: 'categoryId', label: 'Categories', options: { resource: 'categories' } }, statusFilter()],
  fields: [
    { name: 'name', label: 'Subcategory name', required: true },
    { name: 'categoryId', label: 'Category', type: 'select', required: true, options: { resource: 'categories' } },
    { name: 'description', label: 'Description', type: 'textarea', span: 12 },
    statusField(),
  ],
  formSize: 'md',
  viewItems: (r) => [
    { label: 'Category', value: r.categoryName },
    { label: 'Status', value: <StatusBadge value={r.status} /> },
  ],
};
