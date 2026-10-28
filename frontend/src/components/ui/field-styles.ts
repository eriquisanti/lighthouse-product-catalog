import { cn } from '@/lib/cn';

export function fieldClasses(invalid: boolean, className?: string): string {
  return cn(
    'w-full rounded-lg border bg-white px-3 text-sm text-ink transition-colors placeholder:text-muted/70 focus:outline-none focus-visible:ring-3',
    invalid
      ? 'border-brand-strong focus-visible:ring-brand-soft'
      : 'border-line hover:border-muted/40 focus-visible:border-ink/40 focus-visible:ring-canvas',
    className,
  );
}
