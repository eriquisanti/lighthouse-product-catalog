import { randomUUID } from 'node:crypto';
import type {
  FindManyProductsParams,
  FindManyProductsResult,
  ProductRepository,
} from '../../src/repositories/product.repository.js';
import type { ProductInput } from '../../src/schemas/product.schema.js';
import type { Product } from '../../src/types/product.js';

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

function containsIgnoringAccents(value: string, term: string): boolean {
  return normalize(value).includes(normalize(term));
}

export class InMemoryProductRepository implements ProductRepository {
  products: Product[] = [];

  async findMany({
    page,
    limit,
    search,
    category,
  }: FindManyProductsParams): Promise<FindManyProductsResult> {
    const filtered = this.products.filter(
      (product) =>
        (!search || containsIgnoringAccents(product.name, search)) &&
        (!category || containsIgnoringAccents(product.category, category)),
    );
    const start = (page - 1) * limit;

    return { items: filtered.slice(start, start + limit), total: filtered.length };
  }

  async findById(id: string): Promise<Product | null> {
    return this.products.find((product) => product.id === id) ?? null;
  }

  async create(data: ProductInput): Promise<Product> {
    const now = new Date();
    const product: Product = { id: randomUUID(), ...data, createdAt: now, updatedAt: now };
    this.products.push(product);
    return product;
  }

  async update(id: string, data: ProductInput): Promise<Product | null> {
    const index = this.products.findIndex((product) => product.id === id);
    const current = this.products[index];

    if (!current) {
      return null;
    }

    const updated: Product = { ...current, ...data, updatedAt: new Date() };
    this.products[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.products.length;
    this.products = this.products.filter((product) => product.id !== id);
    return this.products.length < initialLength;
  }
}
