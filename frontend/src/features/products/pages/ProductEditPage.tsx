import { SearchX } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { BackLink } from '@/components/layout/BackLink';
import { PageHeader } from '@/components/layout/PageHeader';
import { buttonVariants } from '@/components/ui/button-variants';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { ApiError, getErrorMessage } from '@/lib/http';
import { ProductForm } from '../components/ProductForm';
import { ProductFormSkeleton } from '../components/ProductFormSkeleton';
import { useProduct, useUpdateProduct } from '../hooks/use-products';
import { toProductFormValues } from '../schemas/product-form.schema';
import type { ProductInput } from '../types/product';

function isProductNotFound(error: Error): boolean {
  return error instanceof ApiError && (error.status === 404 || error.status === 400);
}

export function ProductEditPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: product, isPending, isError, error, refetch } = useProduct(id);
  const updateProduct = useUpdateProduct(id);

  async function handleSubmit(input: ProductInput) {
    const updated = await updateProduct.mutateAsync(input);
    toast.success('Alterações salvas', { description: updated.name });
    navigate('/products');
  }

  function renderContent() {
    if (isPending) {
      return <ProductFormSkeleton />;
    }

    if (isError) {
      return isProductNotFound(error) ? (
        <div className="max-w-3xl rounded-xl border border-line bg-white">
          <EmptyState
            icon={<SearchX className="size-5" />}
            title="Produto não encontrado"
            description="O produto pode ter sido removido ou o endereço está incorreto."
            action={
              <Link to="/products" className={buttonVariants({ variant: 'secondary' })}>
                Voltar para produtos
              </Link>
            }
          />
        </div>
      ) : (
        <div className="max-w-3xl rounded-xl border border-line bg-white">
          <ErrorState
            title="Não foi possível carregar o produto"
            message={getErrorMessage(error)}
            onRetry={() => refetch()}
          />
        </div>
      );
    }

    return (
      <ProductForm
        key={product.id}
        defaultValues={toProductFormValues(product)}
        submitLabel="Salvar alterações"
        onSubmit={handleSubmit}
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Editar produto"
        description={
          product ? `Atualize os dados de ${product.name}.` : 'Atualize os dados do produto.'
        }
        backLink={<BackLink to="/products" label="Voltar para produtos" />}
      />
      {renderContent()}
    </>
  );
}
