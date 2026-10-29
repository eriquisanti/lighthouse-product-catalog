import { randomUUID } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { buildApp } from '../../src/app.js';
import type { PrismaClient } from '../../src/generated/prisma/client.js';
import type { ProductInput } from '../../src/schemas/product.schema.js';
import { makeProductInput } from '../helpers/product-factory.js';
import { createTestPrismaClient, resetDatabase } from '../helpers/test-database.js';

describe('Products routes', () => {
  let app: FastifyInstance;
  let prisma: PrismaClient;

  async function insertProduct(overrides: Partial<ProductInput> & { createdAt?: Date } = {}) {
    const record = await prisma.product.create({ data: { ...makeProductInput(), ...overrides } });
    return { ...record, price: record.price.toNumber() };
  }

  beforeAll(async () => {
    prisma = createTestPrismaClient();
    app = await buildApp({ prisma, corsOrigin: [] });
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  describe('GET /products', () => {
    it('returns products ordered by newest first with default pagination', async () => {
      await insertProduct({ name: 'Produto Antigo', createdAt: new Date('2026-01-01') });
      await insertProduct({ name: 'Produto Novo', createdAt: new Date('2026-02-01') });

      const response = await app.inject({ method: 'GET', url: '/products' });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.map((product: { name: string }) => product.name)).toEqual([
        'Produto Novo',
        'Produto Antigo',
      ]);
      expect(body.meta).toEqual({ page: 1, limit: 10, total: 2, totalPages: 1 });
    });

    it('returns prices as numbers', async () => {
      await insertProduct({ price: 19.9 });

      const response = await app.inject({ method: 'GET', url: '/products' });

      expect(response.json().data[0].price).toBe(19.9);
    });

    it('paginates using page and limit', async () => {
      for (let day = 1; day <= 5; day++) {
        await insertProduct({ name: `Produto ${day}`, createdAt: new Date(2026, 0, day) });
      }

      const response = await app.inject({ method: 'GET', url: '/products?page=2&limit=2' });

      const body = response.json();
      expect(body.data.map((product: { name: string }) => product.name)).toEqual([
        'Produto 3',
        'Produto 2',
      ]);
      expect(body.meta).toEqual({ page: 2, limit: 2, total: 5, totalPages: 3 });
    });

    it('searches by partial name ignoring case', async () => {
      await insertProduct({ name: 'Mouse Sem Fio' });
      await insertProduct({ name: 'Teclado Mecânico' });

      const response = await app.inject({ method: 'GET', url: '/products?search=MOUSE' });

      expect(response.json().data).toHaveLength(1);
      expect(response.json().data[0].name).toBe('Mouse Sem Fio');
    });

    it('treats LIKE wildcards in search as literal characters', async () => {
      await insertProduct({ name: 'Desconto 50%' });
      await insertProduct({ name: 'Teclado Mecânico' });

      const response = await app.inject({ method: 'GET', url: '/products?search=%25' });

      expect(response.json().data.map((product: { name: string }) => product.name)).toEqual([
        'Desconto 50%',
      ]);
    });

    it.each([
      ['MECANICO', 'Teclado Mecânico'],
      ['tênis', 'Tênis de Corrida'],
      ['tenis', 'Tênis de Corrida'],
    ])('searches by name ignoring accents and case: %s', async (search, expectedName) => {
      await insertProduct({ name: 'Teclado Mecânico' });
      await insertProduct({ name: 'Tênis de Corrida' });

      const response = await app.inject({
        method: 'GET',
        url: `/products?search=${encodeURIComponent(search)}`,
      });

      expect(response.json().data.map((product: { name: string }) => product.name)).toEqual([
        expectedName,
      ]);
    });

    it.each([
      ['Móveis', 'Cadeira'],
      ['moveis', 'Cadeira'],
      ['INFORM', 'Mouse'],
      ['mática', 'Mouse'],
    ])(
      'filters by partial category ignoring accents and case: %s',
      async (category, expectedName) => {
        await insertProduct({ name: 'Mouse', category: 'Informática' });
        await insertProduct({ name: 'Cadeira', category: 'Móveis' });

        const response = await app.inject({
          method: 'GET',
          url: `/products?category=${encodeURIComponent(category)}`,
        });

        expect(response.json().data.map((product: { name: string }) => product.name)).toEqual([
          expectedName,
        ]);
      },
    );

    it('combines search and category filters', async () => {
      await insertProduct({ name: 'Mouse Gamer', category: 'Informática' });
      await insertProduct({ name: 'Mouse Pad', category: 'Acessórios' });
      await insertProduct({ name: 'Teclado', category: 'Informática' });

      const response = await app.inject({
        method: 'GET',
        url: '/products?search=mouse&category=informatica',
      });

      expect(response.json().data.map((product: { name: string }) => product.name)).toEqual([
        'Mouse Gamer',
      ]);
      expect(response.json().meta.total).toBe(1);
    });

    it.each([
      ['page=0', 'page', 'A página deve ser maior ou igual a 1'],
      ['page=abc', 'page', 'A página deve ser um número'],
      ['limit=0', 'limit', 'O limite deve estar entre 1 e 100'],
      ['limit=101', 'limit', 'O limite deve estar entre 1 e 100'],
    ])('returns 400 for invalid query %s', async (query, field, message) => {
      const response = await app.inject({ method: 'GET', url: `/products?${query}` });

      expect(response.statusCode).toBe(400);
      expect(response.json().errors).toEqual([{ field, message }]);
    });
  });

  describe('GET /products/:id', () => {
    it('returns the product', async () => {
      const product = await insertProduct();

      const response = await app.inject({ method: 'GET', url: `/products/${product.id}` });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({ id: product.id, name: product.name, price: 199.99 });
    });

    it('returns 404 when the product does not exist', async () => {
      const response = await app.inject({ method: 'GET', url: `/products/${randomUUID()}` });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toEqual({
        statusCode: 404,
        error: 'Not Found',
        message: 'Produto não encontrado',
      });
    });

    it('returns 400 when the id is not a valid UUID', async () => {
      const response = await app.inject({ method: 'GET', url: '/products/invalid-id' });

      expect(response.statusCode).toBe(400);
      expect(response.json().errors).toEqual([{ field: 'id', message: 'ID inválido' }]);
    });
  });

  describe('POST /products', () => {
    it('creates a product and returns 201', async () => {
      const input = makeProductInput();

      const response = await app.inject({ method: 'POST', url: '/products', payload: input });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body).toMatchObject(input);
      await expect(prisma.product.count({ where: { id: body.id } })).resolves.toBe(1);
    });

    it('trims text fields and stores an empty description as null', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/products',
        payload: makeProductInput({
          name: '  Mouse Sem Fio  ',
          description: '   ',
          category: ' Informática ',
        }),
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toMatchObject({
        name: 'Mouse Sem Fio',
        description: null,
        category: 'Informática',
      });
    });

    it.each([
      ['name with 3 characters', { name: 'abc' }],
      ['name with 120 characters', { name: 'a'.repeat(120) }],
      ['minimum price', { price: 0.01 }],
      ['zero stock', { stock: 0 }],
      ['no description', { description: undefined }],
    ])('accepts boundary value: %s', async (_label, overrides) => {
      const response = await app.inject({
        method: 'POST',
        url: '/products',
        payload: { ...makeProductInput(), ...overrides },
      });

      expect(response.statusCode).toBe(201);
    });

    it.each([
      ['missing name', { name: undefined }, 'name', 'O nome é obrigatório'],
      [
        'name with 2 characters',
        { name: 'ab' },
        'name',
        'O nome deve ter entre 3 e 120 caracteres',
      ],
      [
        'name too short after trimming',
        { name: '  ab  ' },
        'name',
        'O nome deve ter entre 3 e 120 caracteres',
      ],
      [
        'name with 121 characters',
        { name: 'a'.repeat(121) },
        'name',
        'O nome deve ter entre 3 e 120 caracteres',
      ],
      ['missing price', { price: undefined }, 'price', 'O preço é obrigatório'],
      ['price as string', { price: '19.90' }, 'price', 'O preço deve ser um número'],
      ['zero price', { price: 0 }, 'price', 'O preço deve ser maior que 0'],
      ['negative price', { price: -10 }, 'price', 'O preço deve ser maior que 0'],
      [
        'price with 3 decimals',
        { price: 10.999 },
        'price',
        'O preço deve ter no máximo 2 casas decimais',
      ],
      ['missing stock', { stock: undefined }, 'stock', 'O estoque é obrigatório'],
      ['negative stock', { stock: -1 }, 'stock', 'O estoque não pode ser negativo'],
      ['decimal stock', { stock: 1.5 }, 'stock', 'O estoque deve ser um número inteiro'],
      ['missing category', { category: undefined }, 'category', 'A categoria é obrigatória'],
      ['empty category', { category: '' }, 'category', 'A categoria é obrigatória'],
      ['blank category', { category: '   ' }, 'category', 'A categoria é obrigatória'],
    ])('returns 400 for %s', async (_label, overrides, field, message) => {
      const response = await app.inject({
        method: 'POST',
        url: '/products',
        payload: { ...makeProductInput(), ...overrides },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toEqual({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Dados inválidos',
        errors: [{ field, message }],
      });
      await expect(prisma.product.count()).resolves.toBe(0);
    });

    it('returns every invalid field at once', async () => {
      const response = await app.inject({ method: 'POST', url: '/products', payload: {} });

      expect(response.statusCode).toBe(400);
      expect(response.json().errors.map((error: { field: string }) => error.field)).toEqual([
        'name',
        'price',
        'stock',
        'category',
      ]);
    });

    it('returns 400 for malformed JSON', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/products',
        headers: { 'content-type': 'application/json' },
        payload: '{ invalid json',
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().message).toBe('Corpo da requisição inválido');
    });

    it('returns 400 when the JSON body is empty', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/products',
        headers: { 'content-type': 'application/json' },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().errors).toEqual([
        { field: 'body', message: 'O corpo da requisição deve ser um objeto JSON' },
      ]);
    });

    it('rejects prototype pollution attempts in the JSON body', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/products',
        headers: { 'content-type': 'application/json' },
        payload: '{"__proto__":{"admin":true},"name":"Mouse"}',
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('PUT /products/:id', () => {
    it('updates the product', async () => {
      const product = await insertProduct();
      const input = makeProductInput({ name: 'Mouse Atualizado', price: 149.9, stock: 0 });

      const response = await app.inject({
        method: 'PUT',
        url: `/products/${product.id}`,
        payload: input,
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({ id: product.id, ...input });
    });

    it('returns 404 when the product does not exist', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/products/${randomUUID()}`,
        payload: makeProductInput(),
      });

      expect(response.statusCode).toBe(404);
      expect(response.json().message).toBe('Produto não encontrado');
    });

    it('returns 400 and keeps the product unchanged when the body is invalid', async () => {
      const product = await insertProduct();

      const response = await app.inject({
        method: 'PUT',
        url: `/products/${product.id}`,
        payload: makeProductInput({ price: -1 }),
      });

      expect(response.statusCode).toBe(400);
      const stored = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
      expect(stored.price.toNumber()).toBe(product.price);
    });
  });

  describe('DELETE /products/:id', () => {
    it('removes the product and returns 204', async () => {
      const product = await insertProduct();

      const response = await app.inject({ method: 'DELETE', url: `/products/${product.id}` });

      expect(response.statusCode).toBe(204);
      expect(response.body).toBe('');
      await expect(prisma.product.count()).resolves.toBe(0);
    });

    it('accepts a JSON content-type header without a body', async () => {
      const product = await insertProduct();

      const response = await app.inject({
        method: 'DELETE',
        url: `/products/${product.id}`,
        headers: { 'content-type': 'application/json' },
      });

      expect(response.statusCode).toBe(204);
    });

    it('returns 404 when the product does not exist', async () => {
      const response = await app.inject({ method: 'DELETE', url: `/products/${randomUUID()}` });

      expect(response.statusCode).toBe(404);
    });
  });

  it('returns 404 for unknown routes', async () => {
    const response = await app.inject({ method: 'GET', url: '/unknown' });

    expect(response.statusCode).toBe(404);
    expect(response.json().message).toBe('Rota não encontrada');
  });
});
