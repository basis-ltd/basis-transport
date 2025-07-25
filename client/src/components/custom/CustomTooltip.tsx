import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ReactNode } from 'react';

type CustomTooltipProps = {
  children: ReactNode;
  label?: string;
  labelClassName?: string;
};

const CustomTooltip = ({
  children,
  label,
  labelClassName,
}: CustomTooltipProps) => {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          className={`text-[12px] bg-primary text-white z-[10000] ${labelClassName} rounded-md`}
        >
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CustomTooltip;
