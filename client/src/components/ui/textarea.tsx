import * as React from 'react';

import { cn } from '@/lib/utils';
import { textareaClassName } from '@/components/inputs/control';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(textareaClassName, 'field-sizing-content', className)}
      {...props}
    />
  );
}

export { Textarea };
