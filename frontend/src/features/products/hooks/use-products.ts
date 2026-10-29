import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import { ApiError } from '@/lib/http';
import { productsApi } from '../api/products.api';
import type { Product, ProductInput, ProductListParams, ProductListResult } from '../types/product';
import {
  addProductToList,
  findCachedProduct,
  isFilteredList,
  isFirstUnfilteredPage,
  removeProductFromList,
  replaceProductInList,
} from './product-list-cache';
import { productKeys } from './product-query-keys';

type ListSnapshot = Array<[QueryKey, ProductListResult | undefined]>;

function updateCachedLists(
  queryClient: QueryClient,
  updater: (list: ProductListResult) => ProductListResult,
) {
  queryClient.setQueriesData<ProductListResult>(
    { queryKey: productKeys.lists() },
    (list) => list && updater(list),
  );
}

function markListsAsStale(
  queryClient: QueryClient,
  shouldMark: (list: ProductListResult) => boolean,
) {
  return queryClient.invalidateQueries({
    queryKey: productKeys.lists(),
    refetchType: 'none',
    predicate: ({ state }) => {
      const list = state.data as ProductListResult | undefined;
      return !list || shouldMark(list);
    },
  });
}

function cacheSavedProduct(queryClient: QueryClient, product: Product) {
  queryClient.setQueryData(productKeys.detail(product.id), product);
}

function forgetProduct(queryClient: QueryClient, id: string) {
  queryClient.removeQueries({ queryKey: productKeys.detail(id) });
  updateCachedLists(queryClient, (list) => removeProductFromList(list, id));
}

function refetchVisibleLists(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: productKeys.lists(), refetchType: 'active' });
}

function isNotFoundError(error: Error): boolean {
  return error instanceof ApiError && error.status === 404;
}

export function useProducts(params: ProductListParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: async ({ signal }): Promise<ProductListResult> => ({
      ...(await productsApi.list(params, signal)),
      params,
    }),
    placeholderData: keepPreviousData,
  });
}

export function useProduct(id: string) {
  const queryClient = useQueryClient();
  const cached = findCachedProduct(queryClient, id);

  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: ({ signal }) => productsApi.getById(id, signal),
    initialData: cached?.product,
    initialDataUpdatedAt: cached?.updatedAt,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ProductInput) => productsApi.create(input),
    onSuccess: (product) => {
      cacheSavedProduct(queryClient, product);
      updateCachedLists(queryClient, (list) => addProductToList(list, product));
      return markListsAsStale(queryClient, (list) => !isFirstUnfilteredPage(list));
    },
  });
}

export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ProductInput) => productsApi.update(id, input),
    onSuccess: (product) => {
      cacheSavedProduct(queryClient, product);
      updateCachedLists(queryClient, (list) => replaceProductInList(list, product));
      return markListsAsStale(queryClient, isFilteredList);
    },
    onError: (error) => {
      if (isNotFoundError(error)) {
        forgetProduct(queryClient, id);
        return markListsAsStale(queryClient, () => true);
      }
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onMutate: async (id): Promise<{ previousLists: ListSnapshot }> => {
      await queryClient.cancelQueries({ queryKey: productKeys.lists() });
      const previousLists = queryClient.getQueriesData<ProductListResult>({
        queryKey: productKeys.lists(),
      });
      updateCachedLists(queryClient, (list) => removeProductFromList(list, id));
      return { previousLists };
    },
    onError: (error, id, context) => {
      if (isNotFoundError(error)) {
        forgetProduct(queryClient, id);
        refetchVisibleLists(queryClient);
        return;
      }

      for (const [queryKey, list] of context?.previousLists ?? []) {
        queryClient.setQueryData(queryKey, list);
      }
    },
    onSuccess: (_result, id) => {
      forgetProduct(queryClient, id);
      refetchVisibleLists(queryClient);
    },
  });
}
