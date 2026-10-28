import { Pencil } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { buttonVariants } from '@/components/ui/button-variants';
import { formatCurrency } from '@/lib/format';
import type { Product } from '../types/product';
import { StockBadge } from './StockBadge';

type ProductTableProps = {
  products: Product[];
};

const columnHeaderClass = 'px-4 py-3 text-xs font-medium tracking-wider text-muted uppercase';

export function ProductTableLayout({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left">
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

export function ProductTable({ products }: ProductTableProps) {
  return (
    <ProductTableLayout>
      {products.map((product) => (
        <tr key={product.id} className="transition-colors hover:bg-canvas/60">
          <td className="max-w-xs px-4 py-3">
            <p className="truncate text-sm font-medium">{product.name}</p>
            {product.description && (
              <p className="mt-0.5 truncate text-xs text-muted">{product.description}</p>
            )}
          </td>
          <td className="px-4 py-3">
            <span className="inline-flex rounded-full border border-line px-2.5 py-0.5 text-xs text-muted">
              {product.category}
            </span>
          </td>
          <td className="px-4 py-3 text-right font-mono text-sm">
            {formatCurrency(product.price)}
          </td>
          <td className="px-4 py-3 text-right">
            <StockBadge stock={product.stock} />
          </td>
          <td className="px-4 py-3 text-right">
            <Link
              to={`/products/${product.id}/edit`}
              className={buttonVariants({ variant: 'ghost', size: 'sm' })}
              aria-label={`Editar ${product.name}`}
            >
              <Pencil size={16} />
              Editar
            </Link>
          </td>
        </tr>
      ))}
    </ProductTableLayout>
  );
}
