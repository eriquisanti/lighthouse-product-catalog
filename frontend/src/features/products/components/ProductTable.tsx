import { Pencil, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/Button';
import { buttonVariants } from '@/components/ui/button-variants';
import { formatCurrency } from '@/lib/format';
import type { Product } from '../types/product';
import { StockBadge } from './StockBadge';

type ProductTableProps = {
  products: Product[];
  onDelete: (product: Product) => void;
};

const columnHeaderClass = 'px-4 py-3 text-xs font-medium tracking-wider text-muted uppercase';

export function ProductTableLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative overflow-x-auto">
      <table className="w-full min-w-[860px] table-fixed text-left">
        <colgroup>
          <col />
          <col className="w-44" />
          <col className="w-32" />
          <col className="w-28" />
          <col className="w-52" />
        </colgroup>
        <thead className="border-b border-line">
          <tr>
            <th scope="col" className={columnHeaderClass}>
              Produto
            </th>
            <th scope="col" className={columnHeaderClass}>
              Categoria
            </th>
            <th scope="col" className={`${columnHeaderClass} text-right`}>
              Preço
            </th>
            <th scope="col" className={`${columnHeaderClass} text-right`}>
              Estoque
            </th>
            <th scope="col" className={`${columnHeaderClass} text-right`}>
              <span className="sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}

export function ProductTable({ products, onDelete }: ProductTableProps) {
  return (
    <ProductTableLayout>
      {products.map((product) => (
        <tr key={product.id} className="transition-colors hover:bg-canvas/60">
          <td className="px-4 py-3">
            <p className="truncate text-sm font-medium" title={product.name}>
              {product.name}
            </p>
            {product.description && (
              <p className="mt-0.5 truncate text-xs text-muted" title={product.description}>
                {product.description}
              </p>
            )}
          </td>
          <td className="px-4 py-3">
            <span
              className="inline-block max-w-full truncate rounded-full border border-line px-2.5 py-0.5 align-middle text-xs text-muted"
              title={product.category}
            >
              {product.category}
            </span>
          </td>
          <td className="px-4 py-3 text-right font-mono text-sm whitespace-nowrap">
            {formatCurrency(product.price)}
          </td>
          <td className="px-4 py-3 text-right whitespace-nowrap">
            <StockBadge stock={product.stock} />
          </td>
          <td className="px-4 py-3">
            <div className="flex justify-end gap-1 whitespace-nowrap">
              <Link
                to={`/products/${product.id}/edit`}
                className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                aria-label={`Editar ${product.name}`}
              >
                <Pencil size={16} />
                Editar
              </Link>
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDelete(product)}
                aria-label={`Excluir ${product.name}`}
              >
                <Trash2 size={16} />
                Excluir
              </Button>
            </div>
          </td>
        </tr>
      ))}
    </ProductTableLayout>
  );
}
