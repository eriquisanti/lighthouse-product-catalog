import { NotFoundError } from '../errors/not-found-error.js';
import type { ProductRepository } from '../repositories/product.repository.js';
import type { ListProductsQuery, ProductInput } from '../schemas/product.schema.js';
import type { PaginatedProducts, Product } from '../types/product.js';

const PRODUCT_NOT_FOUND_MESSAGE = 'Produto não encontrado';

export class ProductService {
  constructor(private readonly repository: ProductRepository) {}

  async list(query: ListProductsQuery): Promise<PaginatedProducts> {
    const { items, total } = await this.repository.findMany(query);

    return {
      data: items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async getById(id: string): Promise<Product> {
    const product = await this.repository.findById(id);

    if (!product) {
      throw new NotFoundError(PRODUCT_NOT_FOUND_MESSAGE);
    }

    return product;
  }

  create(input: ProductInput): Promise<Product> {
    return this.repository.create(input);
  }

  async update(id: string, input: ProductInput): Promise<Product> {
    const product = await this.repository.update(id, input);

    if (!product) {
      throw new NotFoundError(PRODUCT_NOT_FOUND_MESSAGE);
    }

    return product;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new NotFoundError(PRODUCT_NOT_FOUND_MESSAGE);
    }
  }
}
