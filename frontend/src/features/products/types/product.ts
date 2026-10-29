export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string;
  createdAt: string;
  updatedAt: string;
};

export type ProductInput = {
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string;
};

export type ProductListParams = {
  page: number;
  limit: number;
  search?: string;
  category?: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedProducts = {
  data: Product[];
  meta: PaginationMeta;
};

export type ProductListResult = PaginatedProducts & {
  params: ProductListParams;
};
