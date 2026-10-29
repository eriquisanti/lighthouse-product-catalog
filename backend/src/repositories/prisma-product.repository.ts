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

function containsIgnoringAccents(column: Prisma.Sql, term: string): Prisma.Sql {
  const pattern = `%${escapeLikePattern(term)}%`;
  return Prisma.sql`immutable_unaccent(${column}) ILIKE immutable_unaccent(${pattern})`;
}

function buildWhereClause({ search, category }: FindManyProductsParams): Prisma.Sql {
  const conditions: Prisma.Sql[] = [];

  if (search) {
    conditions.push(containsIgnoringAccents(Prisma.raw('"name"'), search));
  }

  if (category) {
    conditions.push(containsIgnoringAccents(Prisma.raw('"category"'), category));
  }

  return conditions.length > 0
    ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
    : Prisma.empty;
}

function isRecordNotFound(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === RECORD_NOT_FOUND_CODE
  );
}

export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findMany(params: FindManyProductsParams): Promise<FindManyProductsResult> {
    const where = buildWhereClause(params);
    const offset = (params.page - 1) * params.limit;

    const [records, countRows] = await this.prisma.$transaction([
      this.prisma.$queryRaw<ProductRecord[]>`
        SELECT id, name, description, price, stock, category,
               created_at AS "createdAt", updated_at AS "updatedAt"
        FROM products
        ${where}
        ORDER BY created_at DESC, id DESC
        LIMIT ${params.limit} OFFSET ${offset}
      `,
      this.prisma.$queryRaw<{ total: number }[]>`
        SELECT COUNT(*)::int AS total FROM products ${where}
      `,
    ]);

    return { items: records.map(toProduct), total: countRows[0]?.total ?? 0 };
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
