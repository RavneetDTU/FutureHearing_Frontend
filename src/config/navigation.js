import {
  Boxes,
  Building2,
  CircleDollarSign,
  HeartPulse,
  LayoutDashboard,
  MessagesSquare,
  Package,
  Receipt,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Target,
  Truck,
  Users,
} from 'lucide-react';

/**
 * Sidebar structure. `permission` hides an item when the API-provided permissions exclude it.
 * Children make the item an expandable section.
 */
export const NAVIGATION = [
  {
    title: 'Workspace',
    items: [
      { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, permission: 'dashboard.view' },
      {
        label: 'Products',
        icon: Package,
        permission: 'products.view',
        children: [
          { label: 'All products', to: '/products' },
          { label: 'Companies', to: '/companies' },
          { label: 'Brands', to: '/brands' },
          { label: 'Models', to: '/models' },
          { label: 'Categories', to: '/categories' },
          { label: 'Subcategories', to: '/subcategories' },
        ],
      },
      {
        label: 'Inventory / Stock',
        icon: Boxes,
        permission: 'stock.view',
        children: [
          { label: 'Stock overview', to: '/stock' },
          { label: 'Warehouses', to: '/warehouses' },
        ],
      },
      { label: 'Invoice', to: '/invoices', icon: Receipt, permission: 'invoices.view' },
      {
        label: 'Sales',
        icon: CircleDollarSign,
        permission: 'payments.view',
        children: [
          { label: 'Full Tests', to: '/full-tests', permission: 'invoices.create' },
          { label: 'Payments', to: '/payments', permission: 'payments.view' },
          { label: 'Refunds', to: '/refunds', permission: 'payments.view' },
        ],
      },
      { label: 'Purchases', to: '/purchases', icon: ShoppingCart, permission: 'purchases.view' },
    ],
  },
  {
    title: 'Relationships',
    items: [
      {
        label: 'Patients',
        icon: Users,
        permission: 'patients.view',
        children: [
          { label: 'All patients', to: '/patients' },
          { label: 'Appointments', to: '/appointments' },
          { label: 'Documents', to: '/documents' },
        ],
      },
      {
        label: 'Medical Aids',
        icon: HeartPulse,
        permission: 'medicalAids.view',
        children: [
          { label: 'Medical aids', to: '/medical-aids' },
          { label: 'Medical aid plans', to: '/medical-aid-plans' },
          { label: 'Medical claims', to: '/claims', permission: 'claims.view' },
          { label: 'ICD codes', to: '/icd-codes' },
          { label: 'Procedure codes', to: '/procedure-codes' },
        ],
      },
      { label: 'Leads', to: '/leads', icon: Target, permission: 'leads.view' },
      { label: 'Communications', to: '/communications', icon: MessagesSquare, permission: 'patients.view' },
      { label: 'Suppliers', to: '/suppliers', icon: Truck, permission: 'purchases.view' },
    ],
  },
  {
    title: 'Administration',
    items: [
      {
        label: 'Branches',
        icon: Building2,
        permission: 'branches.view',
        children: [
          { label: 'Branches', to: '/branches' },
          { label: 'Practices', to: '/practices' },
        ],
      },
      {
        label: 'Users & access',
        icon: ShieldCheck,
        permission: 'users.view',
        children: [
          { label: 'Users', to: '/users' },
          { label: 'Roles & permissions', to: '/roles' },
        ],
      },
      { label: 'Settings', to: '/settings', icon: Settings, permission: 'settings.view' },
    ],
  },
];
