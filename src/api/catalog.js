import { createResource } from './resource';

export const companiesApi = createResource('/companies', 'companies');
export const brandsApi = createResource('/brands', 'brands');
export const modelsApi = createResource('/models', 'models');
export const categoriesApi = createResource('/categories', 'categories');
export const subcategoriesApi = createResource('/subcategories', 'subcategories');
export const productsApi = createResource('/products', 'products');
