import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { fieldClasses } from './field-styles';

type InputProps = ComponentProps<'input'> & {
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
        className={fieldClasses(invalid, cn('h-10', Boolean(icon) && 'pl-9', className))}
        {...props}
      />
    </div>
  );
}
