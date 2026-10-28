import { Skeleton } from '@/components/ui/Skeleton';
import { ProductTableLayout } from './ProductTable';

const SKELETON_ROWS = 5;

export function ProductTableSkeleton() {
  return (
    <div role="status" aria-label="Carregando produtos">
      <ProductTableLayout>
        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
          <tr key={index}>
            <td className="px-4 py-4">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="mt-2 h-3 w-64" />
            </td>
            <td className="px-4 py-4">
              <Skeleton className="h-5 w-24 rounded-full" />
            </td>
            <td className="px-4 py-4">
              <Skeleton className="ml-auto h-4 w-20" />
            </td>
            <td className="px-4 py-4">
              <Skeleton className="ml-auto h-4 w-12" />
            </td>
            <td className="px-4 py-4">
              <Skeleton className="ml-auto h-8 w-20" />
            </td>
          </tr>
        ))}
      </ProductTableLayout>
    </div>
  );
}
