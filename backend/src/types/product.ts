export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string;
  createdAt: Date;
  updatedAt: Date;
};

type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedProducts = {
  data: Product[];
  meta: PaginationMeta;
};
