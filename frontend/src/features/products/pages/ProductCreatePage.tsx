import { BackLink } from '@/components/layout/BackLink';
import { PageHeader } from '@/components/layout/PageHeader';

export function ProductCreatePage() {
  return (
    <PageHeader
      title="Novo produto"
      description="Preencha os dados para adicionar um produto ao catálogo."
      backLink={<BackLink to="/products" label="Voltar para produtos" />}
    />
  );
}
