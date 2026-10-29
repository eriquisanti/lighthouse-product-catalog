import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatInteger } from '@/lib/format';
import { Button } from './Button';

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
};

export function Pagination({
  page,
  pageSize,
  total,
  totalPages,
  disabled = false,
  onPageChange,
}: PaginationProps) {
  const firstItem = (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, total);

  return (
    <nav
      aria-label="Paginação"
      className="flex flex-col items-center justify-between gap-3 border-t border-line px-4 py-3 sm:flex-row"
    >
      <p className="text-sm text-muted">
        Mostrando <span className="font-mono text-ink">{formatInteger(firstItem)}</span> a{' '}
        <span className="font-mono text-ink">{formatInteger(lastItem)}</span> de{' '}
        <span className="font-mono text-ink">{formatInteger(total)}</span>
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || page <= 1}
          aria-label="Página anterior"
        >
          <ChevronLeft size={16} />
        </Button>
        <span className="min-w-24 text-center text-sm text-muted">
          Página <span className="font-mono text-ink">{page}</span> de{' '}
          <span className="font-mono text-ink">{totalPages}</span>
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || page >= totalPages}
          aria-label="Próxima página"
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </nav>
  );
}
