import * as React from 'react';

import { cn } from '@/lib/utils';
import { controlClassName } from '@/components/inputs/control';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        controlClassName,
        'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-(--ink)',
        className
      )}
      {...props}
    />
  );
}

export { Input };
