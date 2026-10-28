import { CircleAlert } from 'lucide-react';
import { Button } from './Button';
import { EmptyState } from './EmptyState';

type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = 'Não foi possível carregar os dados',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div role="alert">
      <EmptyState
        icon={<CircleAlert className="size-5" />}
        title={title}
        description={message}
        action={
          onRetry && (
            <Button variant="secondary" onClick={onRetry}>
              Tentar novamente
            </Button>
          )
        }
      />
    </div>
  );
}
