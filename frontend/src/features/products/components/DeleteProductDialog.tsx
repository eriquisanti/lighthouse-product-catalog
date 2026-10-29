import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ApiError, getErrorMessage } from '@/lib/http';
import { useDeleteProduct } from '../hooks/use-products';
import type { Product } from '../types/product';

type DeleteProductDialogProps = {
  product: Product | null;
  onClose: () => void;
};

export function DeleteProductDialog({ product, onClose }: DeleteProductDialogProps) {
  const deleteProduct = useDeleteProduct();

  async function handleConfirm() {
    if (!product) {
      return;
    }

    try {
      await deleteProduct.mutateAsync(product.id);
      toast.success('Produto excluído', { description: product.name });
      onClose();
    } catch (error) {
      toast.error('Não foi possível excluir o produto', { description: getErrorMessage(error) });
      if (error instanceof ApiError && error.status === 404) {
        onClose();
      }
    }
  }

  return (
    <ConfirmDialog
      open={product !== null}
      title="Excluir produto"
      description={
        <>
          Tem certeza de que deseja excluir{' '}
          <strong className="font-medium text-ink">{product?.name}</strong>? Esta ação não pode ser
          desfeita.
        </>
      }
      confirmLabel="Excluir produto"
      pendingLabel="Excluindo…"
      isPending={deleteProduct.isPending}
      onConfirm={handleConfirm}
      onClose={onClose}
    />
  );
}
