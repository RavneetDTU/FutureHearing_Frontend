export * from './catalog';
export * from './inventory';
export * from './sales';
export * from './people';
export * from './medical';
export * from './system';
export { ApiError } from './client';

import { brandsApi, categoriesApi, companiesApi, modelsApi, productsApi, subcategoriesApi } from './catalog';
import { branchesApi, practicesApi, suppliersApi, warehousesApi } from './inventory';
import { fullTestsApi, invoicesApi, paymentsApi, purchasesApi, refundsApi } from './sales';
import { appointmentsApi, communicationsApi, documentsApi, leadsApi, patientsApi } from './people';
import { claimsApi, icdCodesApi, medicalAidPlansApi, medicalAidsApi, procedureCodesApi } from './medical';
import { rolesApi, usersApi } from './system';

/**
 * Registry used by config-driven UI (dropdown option sources, generic list pages).
 * Keys are referenced as strings in field definitions, e.g. `{ options: { resource: 'brands' } }`.
 */
export const resources = {
  products: productsApi,
  companies: companiesApi,
  brands: brandsApi,
  models: modelsApi,
  categories: categoriesApi,
  subcategories: subcategoriesApi,
  branches: branchesApi,
  warehouses: warehousesApi,
  practices: practicesApi,
  suppliers: suppliersApi,
  invoices: invoicesApi,
  fullTests: fullTestsApi,
  payments: paymentsApi,
  refunds: refundsApi,
  purchases: purchasesApi,
  patients: patientsApi,
  leads: leadsApi,
  appointments: appointmentsApi,
  communications: communicationsApi,
  documents: documentsApi,
  medicalAids: medicalAidsApi,
  medicalAidPlans: medicalAidPlansApi,
  icdCodes: icdCodesApi,
  procedureCodes: procedureCodesApi,
  claims: claimsApi,
  users: usersApi,
  roles: rolesApi,
};
