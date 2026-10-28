import {
  Prisma,
  type PrismaClient,
  type Product as ProductRecord,
} from '../generated/prisma/client.js';
import type { ProductInput } from '../schemas/product.schema.js';
import type { Product } from '../types/product.js';
import type {
  FindManyProductsParams,
  FindManyProductsResult,
  ProductRepository,
} from './product.repository.js';

const RECORD_NOT_FOUND_CODE = 'P2025';

function toProduct(record: ProductRecord): Product {
  return { ...record, price: record.price.toNumber() };
}

function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}

function isRecordNotFound(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === RECORD_NOT_FOUND_CODE
  );
}

export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findMany({
    page,
    limit,
    search,
    category,
  }: FindManyProductsParams): Promise<FindManyProductsResult> {
    const where: Prisma.ProductWhereInput = {
      ...(search && { name: { contains: escapeLikePattern(search), mode: 'insensitive' } }),
      ...(category && { category }),
    };

    const [records, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items: records.map(toProduct), total };
  }

  async findById(id: string): Promise<Product | null> {
    const record = await this.prisma.product.findUnique({ where: { id } });
    return record ? toProduct(record) : null;
  }

  async create(data: ProductInput): Promise<Product> {
    const record = await this.prisma.product.create({ data });
    return toProduct(record);
  }

  async update(id: string, data: ProductInput): Promise<Product | null> {
    try {
      const record = await this.prisma.product.update({ where: { id }, data });
      return toProduct(record);
    } catch (error) {
      if (isRecordNotFound(error)) {
        return null;
      }
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.product.delete({ where: { id } });
      return true;
    } catch (error) {
      if (isRecordNotFound(error)) {
        return false;
      }
      throw error;
    }
  }
}
