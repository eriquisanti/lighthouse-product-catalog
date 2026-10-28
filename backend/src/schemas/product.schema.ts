import { z } from 'zod';

const MAX_PRICE = 99_999_999.99;
const MAX_STOCK = 2_147_483_647;
const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 10;

function missingOrInvalid(missingMessage: string, invalidMessage: string) {
  return (issue: { input?: unknown }) =>
    issue.input === undefined || issue.input === null ? missingMessage : invalidMessage;
}

function hasAtMostTwoDecimals(value: number): boolean {
  return Math.round(value * 100) / 100 === value;
}

function emptyToUndefined(value: string | undefined): string | undefined {
  return value === '' ? undefined : value;
}

export const productBodySchema = z.object(
  {
    name: z
      .string({ error: missingOrInvalid('O nome é obrigatório', 'O nome deve ser um texto') })
      .trim()
      .min(3, 'O nome deve ter entre 3 e 120 caracteres')
      .max(120, 'O nome deve ter entre 3 e 120 caracteres'),
    description: z
      .string({ error: 'A descrição deve ser um texto' })
      .trim()
      .nullish()
      .transform((value) => value || null),
    price: z
      .number({ error: missingOrInvalid('O preço é obrigatório', 'O preço deve ser um número') })
      .positive('O preço deve ser maior que 0')
      .max(MAX_PRICE, 'O preço deve ser no máximo 99.999.999,99')
      .refine(hasAtMostTwoDecimals, 'O preço deve ter no máximo 2 casas decimais'),
    stock: z
      .number({
        error: missingOrInvalid('O estoque é obrigatório', 'O estoque deve ser um número inteiro'),
      })
      .int('O estoque deve ser um número inteiro')
      .min(0, 'O estoque não pode ser negativo')
      .max(MAX_STOCK, 'O estoque excede o limite permitido'),
    category: z
      .string({
        error: missingOrInvalid('A categoria é obrigatória', 'A categoria deve ser um texto'),
      })
      .trim()
      .min(1, 'A categoria é obrigatória'),
  },
  { error: 'O corpo da requisição deve ser um objeto JSON' },
);

export const productParamsSchema = z.object({
  id: z.uuid('ID inválido'),
});

export const listProductsQuerySchema = z.object({
  page: z.coerce
    .number({ error: 'A página deve ser um número' })
    .int('A página deve ser um número inteiro')
    .min(1, 'A página deve ser maior ou igual a 1')
    .default(1),
  limit: z.coerce
    .number({ error: 'O limite deve ser um número' })
    .int('O limite deve ser um número inteiro')
    .min(1, `O limite deve estar entre 1 e ${MAX_PAGE_SIZE}`)
    .max(MAX_PAGE_SIZE, `O limite deve estar entre 1 e ${MAX_PAGE_SIZE}`)
    .default(DEFAULT_PAGE_SIZE),
  search: z
    .string({ error: 'A busca deve ser um texto' })
    .trim()
    .optional()
    .transform(emptyToUndefined),
  category: z
    .string({ error: 'A categoria deve ser um texto' })
    .trim()
    .optional()
    .transform(emptyToUndefined),
});

export type ProductInput = z.infer<typeof productBodySchema>;
export type ProductParams = z.infer<typeof productParamsSchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
