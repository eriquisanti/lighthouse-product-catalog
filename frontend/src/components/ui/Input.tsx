import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: ReactNode;
  invalid?: boolean;
};

export function Input({ icon, invalid = false, className, ...props }: InputProps) {
  return (
    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
          {icon}
        </span>
      )}
      <input
        aria-invalid={invalid || undefined}
        className={cn(
          'h-10 w-full rounded-lg border bg-white px-3 text-sm text-ink transition-colors placeholder:text-muted/70 focus:outline-none focus-visible:ring-3',
          invalid
            ? 'border-brand-strong focus-visible:ring-brand-soft'
            : 'border-line hover:border-muted/40 focus-visible:border-ink/40 focus-visible:ring-canvas',
          Boolean(icon) && 'pl-9',
          className,
        )}
        {...props}
      />
    </div>
  );
}
