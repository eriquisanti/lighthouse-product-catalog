import { http } from '@/lib/http';
import type { PaginatedProducts, Product, ProductInput, ProductListParams } from '../types/product';

const PRODUCTS_PATH = '/products';

function productPath(id: string): string {
  return `${PRODUCTS_PATH}/${encodeURIComponent(id)}`;
}

export const productsApi = {
  list: (params: ProductListParams, signal?: AbortSignal) =>
    http.get<PaginatedProducts>(PRODUCTS_PATH, { query: params, signal }),

  getById: (id: string, signal?: AbortSignal) => http.get<Product>(productPath(id), { signal }),

  create: (input: ProductInput) => http.post<Product>(PRODUCTS_PATH, input),

  update: (id: string, input: ProductInput) => http.put<Product>(productPath(id), input),

  remove: (id: string) => http.delete(productPath(id)),
};
