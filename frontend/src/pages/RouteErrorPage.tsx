import { buttonVariants } from '@/components/ui/button-variants';

export function RouteErrorPage() {
  return (
    <div className="flex min-h-dvh flex-col items-start justify-center gap-4 px-6 md:px-16">
      <h1 className="font-display text-3xl font-bold tracking-tight">Algo deu errado</h1>
      <p className="text-sm text-muted">
        Ocorreu um erro inesperado ao exibir esta página. Recarregue para tentar novamente.
      </p>
      <a href="/products" className={buttonVariants({ variant: 'secondary' })}>
        Recarregar
      </a>
    </div>
  );
}
