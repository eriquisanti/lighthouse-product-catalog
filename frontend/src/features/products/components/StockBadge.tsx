import { formatInteger } from '@/lib/format';

type StockBadgeProps = {
  stock: number;
};

export function StockBadge({ stock }: StockBadgeProps) {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-medium text-brand-strong">
        Sem estoque
      </span>
    );
  }

  return (
    <span className="font-mono text-sm">
      {formatInteger(stock)} <span className="font-sans text-muted">un.</span>
    </span>
  );
}
