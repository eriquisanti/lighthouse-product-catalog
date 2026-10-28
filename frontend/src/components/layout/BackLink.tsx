import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';

type BackLinkProps = {
  to: string;
  label: string;
};

export function BackLink({ to, label }: BackLinkProps) {
  return (
    <Link
      to={to}
      className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
    >
      <ArrowLeft size={16} />
      {label}
    </Link>
  );
}
