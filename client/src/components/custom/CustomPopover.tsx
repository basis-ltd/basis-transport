import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ReactNode } from 'react';

type CustomPopoverProps = {
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
};

const CustomPopover = ({
  trigger,
  children,
  className,
}: CustomPopoverProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className={`bg-(--paper) mt-4 w-full p-1 rounded-md border border-(--line) ${className}`}>
        {children}
      </PopoverContent>
    </Popover>
  );
};

export default CustomPopover;
