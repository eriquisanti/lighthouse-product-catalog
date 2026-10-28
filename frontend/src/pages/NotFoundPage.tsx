import { Link } from 'react-router';
import { buttonVariants } from '@/components/ui/button-variants';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-start gap-4 py-16">
      <p className="font-mono text-sm text-brand-strong">404</p>
      <h1 className="font-display text-3xl font-bold tracking-tight">Página não encontrada</h1>
      <p className="text-sm text-muted">O endereço acessado não existe ou foi removido.</p>
      <Link to="/products" className={buttonVariants({ variant: 'secondary' })}>
        Ir para produtos
      </Link>
    </div>
  );
}
