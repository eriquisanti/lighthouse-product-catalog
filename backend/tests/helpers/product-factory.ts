import type { ProductInput } from '../../src/schemas/product.schema.js';

export function makeProductInput(overrides: Partial<ProductInput> = {}): ProductInput {
  return {
    name: 'Mouse Sem Fio',
    description: 'Mouse ergonômico',
    price: 199.99,
    stock: 10,
    category: 'Informática',
    ...overrides,
  };
}
