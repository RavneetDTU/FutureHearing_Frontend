import { Navigate, createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ResourceListPage } from '../components/resource/ResourceListPage';
import { RolesPage } from '../features/admin/RolesPage';
import { usersConfig } from '../features/admin/resources';
import { ForgotPasswordPage } from '../features/auth/ForgotPasswordPage';
import { LoginPage } from '../features/auth/LoginPage';
import { ResetPasswordPage } from '../features/auth/ResetPasswordPage';
import { BranchDetailPage } from '../features/branches/BranchDetailPage';
import { brandsConfig, categoriesConfig, companiesConfig, modelsConfig, subcategoriesConfig } from '../features/catalog/resources';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { appointmentsConfig, communicationsConfig, documentsConfig } from '../features/engagement/resources';
import { StockPage } from '../features/inventory/StockPage';
import { branchesConfig, practicesConfig, suppliersConfig, warehousesConfig } from '../features/inventory/resources';
import { LeadDetailPage } from '../features/leads/LeadDetailPage';
import { leadsConfig } from '../features/leads/resources';
import { ClaimDetailPage } from '../features/medical/ClaimDetailPage';
import { ClaimsListPage } from '../features/medical/ClaimsListPage';
import { IcdCodesPage } from '../features/medical/IcdCodesPage';
import { MedicalAidDetailPage } from '../features/medical/MedicalAidDetailPage';
import { medicalAidPlansConfig, medicalAidsConfig, procedureCodesConfig } from '../features/medical/resources';
import { NotFoundPage, RouteErrorPage } from '../features/misc/NotFoundPage';
import { PatientDetailPage } from '../features/patients/PatientDetailPage';
import { PatientFormPage } from '../features/patients/PatientFormPage';
import { PatientsListPage } from '../features/patients/PatientsListPage';
import { ProductDetailPage } from '../features/products/ProductDetailPage';
import { ProductFormPage } from '../features/products/ProductFormPage';
import { ProductsListPage } from '../features/products/ProductsListPage';
import { PurchaseDetailPage } from '../features/purchases/PurchaseDetailPage';
import { PurchaseFormPage } from '../features/purchases/PurchaseFormPage';
import { PurchasesListPage } from '../features/purchases/PurchasesListPage';
import { InvoiceDetailPage } from '../features/sales/InvoiceDetailPage';
import { InvoiceEditorPage } from '../features/sales/InvoiceEditorPage';
import { InvoicesListPage } from '../features/sales/InvoicesListPage';
import { fullTestsConfig, paymentsConfig, refundsConfig } from '../features/sales/resources';
import { SettingsPage } from '../features/settings/SettingsPage';

const list = (path, crumb, config) => ({ path, handle: { crumb }, element: <ResourceListPage key={path} config={config} /> });

const DETAIL = 'Details';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        errorElement: <RouteErrorPage />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', handle: { crumb: 'Dashboard' }, element: <DashboardPage /> },

          {
            path: 'products',
            handle: { crumb: 'Products' },
            children: [
              { index: true, element: <ProductsListPage /> },
              { path: 'new', handle: { crumb: 'New product' }, element: <ProductFormPage /> },
              { path: ':id', handle: { crumb: DETAIL }, element: <ProductDetailPage /> },
              { path: ':id/edit', handle: { crumb: 'Edit' }, element: <ProductFormPage /> },
            ],
          },
          list('companies', 'Companies', companiesConfig),
          list('brands', 'Brands', brandsConfig),
          list('models', 'Models', modelsConfig),
          list('categories', 'Categories', categoriesConfig),
          list('subcategories', 'Subcategories', subcategoriesConfig),

          { path: 'stock', handle: { crumb: 'Stock' }, element: <StockPage /> },
          list('warehouses', 'Warehouses', warehousesConfig),
          {
            path: 'branches',
            handle: { crumb: 'Branches' },
            children: [
              { index: true, element: <ResourceListPage key="branches" config={branchesConfig} /> },
              { path: ':id', handle: { crumb: DETAIL }, element: <BranchDetailPage /> },
            ],
          },
          list('practices', 'Practices', practicesConfig),
          list('suppliers', 'Suppliers', suppliersConfig),

          {
            path: 'invoices',
            handle: { crumb: 'Invoices' },
            children: [
              { index: true, element: <InvoicesListPage /> },
              { path: 'new', handle: { crumb: 'New invoice' }, element: <InvoiceEditorPage key="new" /> },
              { path: ':id', handle: { crumb: DETAIL }, element: <InvoiceDetailPage /> },
              { path: ':id/edit', handle: { crumb: 'Edit' }, element: <InvoiceEditorPage key="edit" /> },
            ],
          },
          list('full-tests', 'Full Tests', fullTestsConfig),
          list('payments', 'Payments', paymentsConfig),
          list('refunds', 'Refunds', refundsConfig),
          {
            path: 'purchases',
            handle: { crumb: 'Purchases' },
            children: [
              { index: true, element: <PurchasesListPage /> },
              { path: 'new', handle: { crumb: 'New purchase' }, element: <PurchaseFormPage key="new" /> },
              { path: ':id', handle: { crumb: DETAIL }, element: <PurchaseDetailPage /> },
              { path: ':id/edit', handle: { crumb: 'Edit' }, element: <PurchaseFormPage key="edit" /> },
            ],
          },

          {
            path: 'patients',
            handle: { crumb: 'Patients' },
            children: [
              { index: true, element: <PatientsListPage /> },
              { path: 'new', handle: { crumb: 'New patient' }, element: <PatientFormPage key="new" /> },
              { path: ':id', handle: { crumb: DETAIL }, element: <PatientDetailPage /> },
              { path: ':id/edit', handle: { crumb: 'Edit' }, element: <PatientFormPage key="edit" /> },
            ],
          },
          list('appointments', 'Appointments', appointmentsConfig),
          list('documents', 'Documents', documentsConfig),
          list('communications', 'Communications', communicationsConfig),

          {
            path: 'medical-aids',
            handle: { crumb: 'Medical aids' },
            children: [
              { index: true, element: <ResourceListPage key="medical-aids" config={medicalAidsConfig} /> },
              { path: ':id', handle: { crumb: DETAIL }, element: <MedicalAidDetailPage /> },
            ],
          },
          list('medical-aid-plans', 'Medical aid plans', medicalAidPlansConfig),
          { path: 'icd-codes', handle: { crumb: 'ICD codes' }, element: <IcdCodesPage /> },
          list('procedure-codes', 'Procedure codes', procedureCodesConfig),
          {
            path: 'claims',
            handle: { crumb: 'Medical claims' },
            children: [
              { index: true, element: <ClaimsListPage /> },
              { path: ':id', handle: { crumb: DETAIL }, element: <ClaimDetailPage /> },
            ],
          },

          {
            path: 'leads',
            handle: { crumb: 'Leads' },
            children: [
              { index: true, element: <ResourceListPage key="leads" config={leadsConfig} /> },
              { path: ':id', handle: { crumb: DETAIL }, element: <LeadDetailPage /> },
            ],
          },
          list('users', 'Users', usersConfig),
          { path: 'roles', handle: { crumb: 'Roles & permissions' }, element: <RolesPage /> },
          {
            path: 'settings',
            handle: { crumb: 'Settings' },
            children: [
              { index: true, element: <SettingsPage /> },
              { path: ':section', element: <SettingsPage /> },
            ],
          },

          { path: '*', handle: { crumb: 'Not found' }, element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
