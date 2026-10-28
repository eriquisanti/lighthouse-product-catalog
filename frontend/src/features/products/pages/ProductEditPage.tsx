import { BackLink } from '@/components/layout/BackLink';
import { PageHeader } from '@/components/layout/PageHeader';

export function ProductEditPage() {
  return (
    <PageHeader
      title="Editar produto"
      description="Atualize os dados do produto."
      backLink={<BackLink to="/products" label="Voltar para produtos" />}
    />
  );
}
