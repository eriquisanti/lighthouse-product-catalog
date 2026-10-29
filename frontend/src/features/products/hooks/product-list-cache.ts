import type { QueryClient } from '@tanstack/react-query';
import type { Product, ProductListResult } from '../types/product';
import { productKeys } from './product-query-keys';

type CachedProduct = {
  product: Product;
  updatedAt: number;
};

function withTotal(list: ProductListResult, data: Product[], total: number): ProductListResult {
  return {
    ...list,
    data,
    meta: {
      ...list.meta,
      total,
      totalPages: Math.ceil(total / list.meta.limit),
    },
  };
}

export function isFilteredList({ params }: ProductListResult): boolean {
  return Boolean(params.search || params.category);
}

export function isFirstUnfilteredPage(list: ProductListResult): boolean {
  return list.params.page === 1 && !isFilteredList(list);
}

export function addProductToList(list: ProductListResult, product: Product): ProductListResult {
  if (!isFirstUnfilteredPage(list)) {
    return list;
  }

  const data = [product, ...list.data].slice(0, list.meta.limit);
  return withTotal(list, data, list.meta.total + 1);
}

export function replaceProductInList(list: ProductListResult, product: Product): ProductListResult {
  if (!list.data.some(({ id }) => id === product.id)) {
    return list;
  }

  return {
    ...list,
    data: list.data.map((item) => (item.id === product.id ? product : item)),
  };
}

export function removeProductFromList(list: ProductListResult, id: string): ProductListResult {
  if (!list.data.some((item) => item.id === id)) {
    return list;
  }

  return withTotal(
    list,
    list.data.filter((item) => item.id !== id),
    list.meta.total - 1,
  );
}

export function findCachedProduct(queryClient: QueryClient, id: string): CachedProduct | undefined {
  const listQueries = queryClient.getQueryCache().findAll({ queryKey: productKeys.lists() });

  for (const query of listQueries) {
    const list = query.state.data as ProductListResult | undefined;
    const product = list?.data.find((item) => item.id === id);
    if (product) {
      return { product, updatedAt: query.state.dataUpdatedAt };
    }
  }

  return undefined;
}
