import { zodResolver } from '@hookform/resolvers/zod';
import { CircleAlert, LoaderCircle } from 'lucide-react';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import { Link } from 'react-router';
import { Button } from '@/components/ui/Button';
import { buttonVariants } from '@/components/ui/button-variants';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ApiError, getErrorMessage } from '@/lib/http';
import { maskCurrency, maskInteger } from '@/lib/input-masks';
import { productFormSchema, type ProductFormValues } from '../schemas/product-form.schema';
import type { ProductInput } from '../types/product';

const PRODUCT_FIELDS = ['name', 'description', 'price', 'stock', 'category'] as const;

type ProductField = (typeof PRODUCT_FIELDS)[number];

function isProductField(field: string): field is ProductField {
  return (PRODUCT_FIELDS as readonly string[]).includes(field);
}

function withInputMask<T extends UseFormRegisterReturn>(
  field: T,
  mask: (value: string) => string,
): T {
  return {
    ...field,
    onChange: (event) => {
      event.target.value = mask(event.target.value);
      return field.onChange(event);
    },
  };
}

type ProductFormProps = {
  defaultValues: ProductFormValues;
  submitLabel: string;
  onSubmit: (input: ProductInput) => Promise<void>;
};

export function ProductForm({ defaultValues, submitLabel, onSubmit }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues, unknown, ProductInput>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
    mode: 'onTouched',
  });

  function applyServerErrors(error: unknown) {
    const fieldErrors =
      error instanceof ApiError
        ? error.fieldErrors.filter(({ field }) => isProductField(field))
        : [];

    if (fieldErrors.length === 0) {
      setError('root.server', { type: 'server', message: getErrorMessage(error) });
      return;
    }

    for (const { field, message } of fieldErrors) {
      setError(field as ProductField, { type: 'server', message }, { shouldFocus: true });
    }
  }

  async function submit(input: ProductInput) {
    clearErrors('root');

    try {
      await onSubmit(input);
    } catch (error) {
      applyServerErrors(error);
    }
  }

  function describedBy(field: ProductField): string | undefined {
    return errors[field] ? `product-${field}-error` : `product-${field}-hint`;
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      noValidate
      className="max-w-3xl rounded-xl border border-line bg-white"
    >
      <div className="grid gap-5 p-6 sm:grid-cols-2">
        {errors.root?.server && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg bg-brand-soft px-4 py-3 text-sm text-brand-strong sm:col-span-2"
          >
            <CircleAlert size={16} className="mt-0.5 shrink-0" />
            {errors.root.server.message}
          </div>
        )}

        <div className="sm:col-span-2">
          <FormField id="product-name" label="Nome" error={errors.name?.message}>
            <Input
              id="product-name"
              placeholder="Ex.: Mouse sem fio"
              autoComplete="off"
              invalid={Boolean(errors.name)}
              aria-describedby={describedBy('name')}
              {...register('name')}
            />
          </FormField>
        </div>

        <div className="sm:col-span-2">
          <FormField
            id="product-description"
            label="Descrição"
            optional
            hint="Detalhes que ajudam a identificar o produto."
            error={errors.description?.message}
          >
            <Textarea
              id="product-description"
              placeholder="Ex.: Mouse ergonômico com sensor de 16.000 DPI"
              invalid={Boolean(errors.description)}
              aria-describedby={describedBy('description')}
              {...register('description')}
            />
          </FormField>
        </div>

        <FormField
          id="product-price"
          label="Preço"
          hint="Digite apenas números. Os centavos são preenchidos automaticamente."
          error={errors.price?.message}
        >
          <Input
            id="product-price"
            inputMode="numeric"
            placeholder="0,00"
            autoComplete="off"
            icon={<span className="text-sm">R$</span>}
            className="font-mono"
            invalid={Boolean(errors.price)}
            aria-describedby={describedBy('price')}
            {...withInputMask(register('price'), maskCurrency)}
          />
        </FormField>

        <FormField
          id="product-stock"
          label="Estoque"
          hint="Quantidade disponível, em unidades inteiras."
          error={errors.stock?.message}
        >
          <Input
            id="product-stock"
            inputMode="numeric"
            placeholder="0"
            autoComplete="off"
            className="font-mono"
            invalid={Boolean(errors.stock)}
            aria-describedby={describedBy('stock')}
            {...withInputMask(register('stock'), maskInteger)}
          />
        </FormField>

        <div className="sm:col-span-2">
          <FormField id="product-category" label="Categoria" error={errors.category?.message}>
            <Input
              id="product-category"
              placeholder="Ex.: Informática"
              invalid={Boolean(errors.category)}
              aria-describedby={describedBy('category')}
              {...register('category')}
            />
          </FormField>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-line px-6 py-4 sm:flex-row sm:justify-end">
        <Link to="/products" className={buttonVariants({ variant: 'secondary' })}>
          Cancelar
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <LoaderCircle size={16} className="animate-spin" />
              Salvando…
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}
