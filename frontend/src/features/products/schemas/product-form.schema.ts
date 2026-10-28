import { z } from 'zod';
import { formatDecimal } from '@/lib/format';
import { parseDecimal } from '@/lib/parse-decimal';
import type { Product } from '../types/product';

const MAX_PRICE = 99_999_999.99;
const MAX_STOCK = 2_147_483_647;
const INTEGER_FORMAT = /^-?\d+$/;

function hasAtMostTwoDecimals(value: number): boolean {
  return Math.round(value * 100) / 100 === value;
}

export const productFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: 'O nome é obrigatório', abort: true })
    .min(3, 'O nome deve ter entre 3 e 120 caracteres')
    .max(120, 'O nome deve ter entre 3 e 120 caracteres'),
  description: z
    .string()
    .trim()
    .transform((value) => value || null),
  price: z
    .string()
    .trim()
    .min(1, { error: 'O preço é obrigatório', abort: true })
    .transform((value, context) => {
      const parsed = parseDecimal(value);
      if (parsed === null) {
        context.addIssue({
          code: 'custom',
          message: 'Informe um preço válido, por exemplo 1.299,90',
        });
        return z.NEVER;
      }
      return parsed;
    })
    .pipe(
      z
        .number()
        .positive('O preço deve ser maior que 0')
        .max(MAX_PRICE, 'O preço deve ser no máximo 99.999.999,99')
        .refine(hasAtMostTwoDecimals, 'O preço deve ter no máximo 2 casas decimais'),
    ),
  stock: z
    .string()
    .trim()
    .min(1, { error: 'O estoque é obrigatório', abort: true })
    .regex(INTEGER_FORMAT, 'O estoque deve ser um número inteiro')
    .transform(Number)
    .pipe(
      z
        .number()
        .min(0, 'O estoque não pode ser negativo')
        .max(MAX_STOCK, 'O estoque excede o limite permitido'),
    ),
  category: z.string().trim().min(1, 'A categoria é obrigatória'),
});

export type ProductFormValues = z.input<typeof productFormSchema>;

export const emptyProductFormValues: ProductFormValues = {
  name: '',
  description: '',
  price: '',
  stock: '',
  category: '',
};

export function toProductFormValues(product: Product): ProductFormValues {
  return {
    name: product.name,
    description: product.description ?? '',
    price: formatDecimal(product.price),
    stock: String(product.stock),
    category: product.category,
  };
}
