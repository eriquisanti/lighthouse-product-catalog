import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { BackLink } from '@/components/layout/BackLink';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProductForm } from '../components/ProductForm';
import { useCreateProduct } from '../hooks/use-products';
import { emptyProductFormValues } from '../schemas/product-form.schema';
import type { ProductInput } from '../types/product';

export function ProductCreatePage() {
  const navigate = useNavigate();
  const createProduct = useCreateProduct();

  async function handleSubmit(input: ProductInput) {
    const product = await createProduct.mutateAsync(input);
    toast.success('Produto criado', { description: product.name });
    navigate('/products');
  }

  return (
    <>
      <PageHeader
        title="Novo produto"
        description="Preencha os dados para adicionar um produto ao catálogo."
        backLink={<BackLink to="/products" label="Voltar para produtos" />}
      />
      <ProductForm
        defaultValues={emptyProductFormValues}
        submitLabel="Criar produto"
        onSubmit={handleSubmit}
      />
    </>
  );
}
