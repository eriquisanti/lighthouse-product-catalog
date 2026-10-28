import type { ProductInput } from '../schemas/product.schema.js';
import type { Product } from '../types/product.js';

export type FindManyProductsParams = {
  page: number;
  limit: number;
  search?: string;
  category?: string;
};

export type FindManyProductsResult = {
  items: Product[];
  total: number;
};

export interface ProductRepository {
  findMany(params: FindManyProductsParams): Promise<FindManyProductsResult>;
  findById(id: string): Promise<Product | null>;
  create(data: ProductInput): Promise<Product>;
  update(id: string, data: ProductInput): Promise<Product | null>;
  delete(id: string): Promise<boolean>;
}
