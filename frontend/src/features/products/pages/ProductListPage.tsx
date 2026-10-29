import { Package, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { buttonVariants } from '@/components/ui/button-variants';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Pagination } from '@/components/ui/Pagination';
import { getErrorMessage } from '@/lib/http';
import { DeleteProductDialog } from '../components/DeleteProductDialog';
import { ProductFilters } from '../components/ProductFilters';
import { ProductTable } from '../components/ProductTable';
import { ProductTableSkeleton } from '../components/ProductTableSkeleton';
import { useProductFilters } from '../hooks/use-product-filters';
import { useProducts } from '../hooks/use-products';
import type { Product } from '../types/product';

const PAGE_SIZE = 10;

function NewProductLink() {
  return (
    <Link to="/products/new" className={buttonVariants()}>
      <Plus size={16} />
      Novo produto
    </Link>
  );
}

export function ProductListPage() {
  const filters = useProductFilters();
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const { data, isPending, isError, error, isFetching, isPlaceholderData, refetch } = useProducts({
    page: filters.page,
    limit: PAGE_SIZE,
    search: filters.search.trim() || undefined,
    category: filters.category.trim() || undefined,
  });

  const totalPages = data?.meta.totalPages ?? 0;
  const { page, setPage } = filters;

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages, setPage]);

  function renderContent() {
    if (isPending) {
      return <ProductTableSkeleton />;
    }

    if (isError) {
      return <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />;
    }

    if (data.data.length === 0) {
      const isFiltered = Boolean(data.params.search || data.params.category);

      return isFiltered ? (
        <EmptyState
          icon={<Search className="size-5" />}
          title="Nenhum produto encontrado"
          description="Nenhum produto corresponde aos filtros aplicados. Ajuste a busca ou limpe os filtros."
          action={
            <Button variant="secondary" onClick={filters.clearFilters}>
              Limpar filtros
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon={<Package className="size-5" />}
          title="Nenhum produto cadastrado"
          description="Cadastre o primeiro produto para começar a montar o catálogo."
          action={<NewProductLink />}
        />
      );
    }

    return (
      <>
        <ProductTable products={data.data} onDelete={setProductToDelete} />
        <Pagination
          page={data.meta.page}
          pageSize={data.meta.limit}
          total={data.meta.total}
          totalPages={data.meta.totalPages}
          disabled={isPlaceholderData}
          onPageChange={setPage}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Produtos"
        description="Gerencie os produtos do seu catálogo."
        actions={<NewProductLink />}
      />

      <section className="overflow-hidden rounded-xl border border-line bg-white">
        <ProductFilters
          search={filters.search}
          category={filters.category}
          onSearchChange={filters.setSearch}
          onCategoryChange={filters.setCategory}
          onClear={filters.clearFilters}
        />
        <div aria-busy={isFetching}>{renderContent()}</div>
      </section>

      <DeleteProductDialog product={productToDelete} onClose={() => setProductToDelete(null)} />
    </>
  );
}
