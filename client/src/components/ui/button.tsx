import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * The press effect is the signature move: a 999px inset spread floods the
 * whole control with a translucent overlay regardless of its size. Never
 * substitute scale(0.98) or translateY(1px) — a transform fights the flood and
 * wins, which makes the flood invisible.
 *
 * Focus is an inner ring in the ground colour and an outer ring in the ink
 * colour: legible on any surface, in either theme, with zero hue.
 *
 * Buttons cast no shadow, ever. Only menus, popovers, and modals get one.
 */
const buttonVariants = cva(
  [
    'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap',
    'rounded-(--radius-control) text-sm font-medium',
    'transition-[background-color,color,border-color,box-shadow]',
    'duration-200 ease-(--ease-flat) outline-none',
    'focus-visible:shadow-[var(--paper)_0_0_0_2px_inset,var(--ink)_0_0_0_2px]',
    'disabled:pointer-events-none disabled:opacity-40',
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          'bg-(--ink) text-(--paper) hover:bg-[color-mix(in_oklab,var(--ink)_88%,var(--paper))] active:shadow-[var(--press-on-ink)_999px_999px_0_inset]',
        secondary:
          'bg-(--surface) text-(--ink) hover:bg-(--surface-hover) active:shadow-[var(--press-on-paper)_999px_999px_0_inset]',
        /* An outline that flips to a solid ink fill on hover is a primary
           button wearing a disguise — and it takes any child icon with a fixed
           colour down to invisible. Border and label keep their colour. */
        outline:
          'border border-(--ink) bg-transparent text-(--ink) hover:bg-(--surface) active:shadow-[var(--press-on-paper)_999px_999px_0_inset]',
        /* The trigger shape: anything that opens a panel and sits in a form
           row, so it lines up with the inputs beside it. */
        field:
          'justify-start border border-(--line) bg-(--paper) font-normal text-(--ink) hover:border-(--line-strong) focus-visible:border-(--ink) focus-visible:shadow-[var(--ink)_0_0_0_1px_inset]',
        ghost:
          'bg-transparent text-(--ink) hover:bg-(--surface) active:shadow-[var(--press-on-paper)_999px_999px_0_inset]',
        link: 'link-sweep h-auto p-0 text-(--ink) active:text-(--muted)',
        destructive:
          'bg-(--danger) text-(--on-consequence) hover:bg-[color-mix(in_oklab,var(--danger)_88%,black)] active:shadow-[var(--press-on-ink)_999px_999px_0_inset]',
        approve:
          'bg-(--approve) text-(--on-consequence) hover:bg-[color-mix(in_oklab,var(--approve)_88%,black)] active:shadow-[var(--press-on-ink)_999px_999px_0_inset]',
      },
      /* These are the control tokens, not free numbers. Text stays 14px at
         every size — `lg` is a taller target, not louder type. */
      size: {
        default: 'h-(--control-md) px-4',
        sm: 'h-(--control-sm) px-3.5',
        lg: 'h-(--control-lg) px-6',
        icon: 'size-(--control-md)',
        'icon-sm': 'size-(--control-sm)',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
