import { Link } from 'react-router';
import { PageHeader } from '@/components/layout/PageHeader';
import { buttonVariants } from '@/components/ui/button-variants';
import { PlusIcon } from '@/components/ui/icons';

export function ProductListPage() {
  return (
    <PageHeader
      title="Produtos"
      description="Gerencie os produtos do seu catálogo."
      actions={
        <Link to="/products/new" className={buttonVariants()}>
          <PlusIcon />
          Novo produto
        </Link>
      }
    />
  );
}
