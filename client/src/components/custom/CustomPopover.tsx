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
      <PopoverContent className={`bg-white mt-4 w-full p-1 rounded-md border border-primary/10 shadow-sm ${className}`}>
        {children}
      </PopoverContent>
    </Popover>
  );
};

export default CustomPopover;
