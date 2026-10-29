import { LoaderCircle, TriangleAlert } from 'lucide-react';
import {
  useEffect,
  useId,
  useRef,
  type MouseEvent,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import { Button } from './Button';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  pendingLabel?: string;
  isPending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  pendingLabel = 'Aguarde…',
  isPending = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function requestClose() {
    if (!isPending) {
      onClose();
    }
  }

  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault();
    requestClose();
  }

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) {
      requestClose();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-line bg-white text-ink shadow-xl backdrop:bg-ink/40"
    >
      <div className="flex gap-4 p-6">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-strong">
          <TriangleAlert size={18} />
        </div>
        <div className="min-w-0">
          <h2 id={titleId} className="font-display text-lg font-semibold">
            {title}
          </h2>
          <div id={descriptionId} className="mt-1 text-sm text-muted">
            {description}
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-line px-6 py-4 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={requestClose} disabled={isPending} autoFocus>
          Cancelar
        </Button>
        <Button onClick={onConfirm} disabled={isPending}>
          {isPending ? (
            <>
              <LoaderCircle size={16} className="animate-spin" />
              {pendingLabel}
            </>
          ) : (
            confirmLabel
          )}
        </Button>
      </div>
    </dialog>
  );
}
