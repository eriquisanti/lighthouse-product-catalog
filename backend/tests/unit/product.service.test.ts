import { randomUUID } from 'node:crypto';
import { beforeEach, describe, expect, it } from 'vitest';
import { NotFoundError } from '../../src/errors/not-found-error.js';
import { ProductService } from '../../src/services/product.service.js';
import { InMemoryProductRepository } from '../helpers/in-memory-product.repository.js';
import { makeProductInput } from '../helpers/product-factory.js';

describe('ProductService', () => {
  let repository: InMemoryProductRepository;
  let service: ProductService;

  beforeEach(() => {
    repository = new InMemoryProductRepository();
    service = new ProductService(repository);
  });

  describe('list', () => {
    it('returns the requested page with pagination metadata', async () => {
      await repository.create(makeProductInput({ name: 'Produto A' }));
      await repository.create(makeProductInput({ name: 'Produto B' }));
      await repository.create(makeProductInput({ name: 'Produto C' }));

      const result = await service.list({ page: 2, limit: 2 });

      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({ page: 2, limit: 2, total: 3, totalPages: 2 });
    });

    it('returns zero pages when there are no products', async () => {
      const result = await service.list({ page: 1, limit: 10 });

      expect(result.data).toEqual([]);
      expect(result.meta).toEqual({ page: 1, limit: 10, total: 0, totalPages: 0 });
    });

    it('applies search and category filters', async () => {
      await repository.create(makeProductInput({ name: 'Mouse Gamer', category: 'Informática' }));
      await repository.create(makeProductInput({ name: 'Mouse Pad', category: 'Acessórios' }));
      await repository.create(makeProductInput({ name: 'Teclado', category: 'Informática' }));

      const result = await service.list({
        page: 1,
        limit: 10,
        search: 'mouse',
        category: 'Informática',
      });

      expect(result.data.map((product) => product.name)).toEqual(['Mouse Gamer']);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('getById', () => {
    it('returns the product when it exists', async () => {
      const created = await repository.create(makeProductInput());

      await expect(service.getById(created.id)).resolves.toEqual(created);
    });

    it('throws NotFoundError when the product does not exist', async () => {
      await expect(service.getById(randomUUID())).rejects.toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    it('creates and returns the product', async () => {
      const input = makeProductInput();

      const product = await service.create(input);

      expect(product).toMatchObject(input);
      expect(product.id).toEqual(expect.any(String));
      expect(repository.products).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('updates and returns the product', async () => {
      const created = await repository.create(makeProductInput());
      const input = makeProductInput({ name: 'Mouse Atualizado', price: 149.9 });

      const updated = await service.update(created.id, input);

      expect(updated).toMatchObject({ id: created.id, ...input });
    });

    it('throws NotFoundError when the product does not exist', async () => {
      await expect(service.update(randomUUID(), makeProductInput())).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('removes the product', async () => {
      const created = await repository.create(makeProductInput());

      await service.delete(created.id);

      expect(repository.products).toHaveLength(0);
    });

    it('throws NotFoundError when the product does not exist', async () => {
      await expect(service.delete(randomUUID())).rejects.toThrow(NotFoundError);
    });
  });
});
