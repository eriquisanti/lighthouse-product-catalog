import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import { fieldClasses } from './field-styles';

type TextareaProps = ComponentProps<'textarea'> & {
  invalid?: boolean;
};

export function Textarea({ invalid = false, className, rows = 4, ...props }: TextareaProps) {
  return (
    <textarea
      rows={rows}
      aria-invalid={invalid || undefined}
      className={fieldClasses(invalid, cn('resize-y py-2', className))}
      {...props}
    />
  );
}
