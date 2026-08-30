import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cva, type VariantProps } from 'class-variance-authority';
import { FC, MouseEventHandler, ReactNode, HTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button as ButtonUI } from '../ui/button';
import { Spinner } from '../ui/spinner';

/**
 * Three tones for actions, plus breadcrumb for wayfinding.
 *
 * `primary` is the one thing this screen wants you to do; `outline` is a
 * bordered secondary action; `breadcrumb` is a compact back/wayfinding chip
 * (surface fill, no ink border) used at the top of public and legal pages.
 *
 * `ui/button` stays stock; the whole visual contract lives here.
 */
const shellVariants = cva(
  [
    'cursor-pointer font-medium rounded-(--radius-control)',
    'transition-[background-color,color,border-color,box-shadow]',
    'duration-200 ease-(--ease-flat) shadow-none outline-none',
    'focus-visible:ring-0 focus-visible:border-(--ink)',
    'focus-visible:shadow-[var(--paper)_0_0_0_2px_inset,var(--ink)_0_0_0_2px]',
    'disabled:pointer-events-none disabled:opacity-40',
    'inline-flex items-center justify-center gap-2',
  ].join(' '),
  {
    variants: {
      tone: {
        primary:
          'bg-(--ink) text-(--paper) border border-(--ink) hover:bg-[color-mix(in_oklab,var(--ink)_88%,var(--paper))] hover:border-[color-mix(in_oklab,var(--ink)_88%,var(--paper))] active:shadow-[var(--press-on-ink)_999px_999px_0_inset]',
        outline:
          'bg-transparent text-(--ink) border border-(--ink) hover:bg-(--surface) active:shadow-[var(--press-on-paper)_999px_999px_0_inset]',
        breadcrumb:
          'w-fit border border-transparent bg-(--surface) text-(--ink) font-normal hover:border-(--line) hover:bg-(--surface-hover) active:shadow-[var(--press-on-paper)_999px_999px_0_inset]',
      },
      scale: {
        sm: 'h-(--control-sm) px-3.5 text-sm',
        default: 'h-(--control-md) px-4 text-sm',
        lg: 'h-(--control-lg) px-6 text-sm',
        icon: 'size-(--control-md) px-0',
        'icon-sm': 'size-(--control-sm) px-0',
        breadcrumb: 'h-auto py-2 px-4 text-[0.8125rem] leading-snug gap-1.5 [&_svg]:size-3.5',
      },
    },
    defaultVariants: { tone: 'outline', scale: 'default' },
    compoundVariants: [
      {
        tone: 'breadcrumb',
        scale: 'default',
        class: 'h-auto py-2 px-4 text-[0.8125rem] leading-snug gap-1.5 [&_svg]:size-3.5',
      },
    ],
  }
);

type ButtonTone = NonNullable<VariantProps<typeof shellVariants>['tone']>;
type ButtonScale = NonNullable<VariantProps<typeof shellVariants>['scale']>;

interface ButtonProps
  extends Omit<
    HTMLAttributes<HTMLButtonElement | HTMLAnchorElement>,
    'onClick'
  > {
  route?: string;
  value?: ReactNode;
  onClick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
  type?: 'submit' | 'button' | 'reset' | null;
  disabled?: boolean;
  /** Shorthand for variant="primary". */
  primary?: boolean;
  submit?: boolean;
  icon?: IconProp;
  isLoading?: boolean;
  children?: ReactNode;
  variant?: ButtonTone;
  size?: ButtonScale;
  /** Associates a submit button with a form by id when rendered outside it. */
  form?: string;
}

const Button: FC<ButtonProps> = ({
  route = '#',
  value,
  onClick,
  type = null,
  disabled = false,
  primary = false,
  className,
  submit = false,
  icon,
  isLoading = false,
  children,
  variant,
  size = 'default',
  ...rest
}) => {
  const tone: ButtonTone = variant ?? (primary ? 'primary' : 'outline');
  const resolvedScale =
    size ?? (tone === 'breadcrumb' ? 'breadcrumb' : 'default');
  const classes = cn(shellVariants({ tone, scale: resolvedScale }), className);

  const content = isLoading ? (
    <Spinner className="size-4" />
  ) : (
    <>
      {icon ? <FontAwesomeIcon icon={icon} aria-hidden="true" /> : null}
      {children || value}
    </>
  );

  if (submit || type) {
    return (
      <ButtonUI
        type={type || 'submit'}
        onClick={onClick as MouseEventHandler<HTMLButtonElement> | undefined}
        className={classes}
        disabled={disabled || isLoading}
        {...rest}
      >
        {content}
      </ButtonUI>
    );
  }

  return (
    <ButtonUI asChild className={classes} disabled={disabled || isLoading}>
      <Link
        to={disabled ? '#' : route}
        onClick={(event) => {
          if (disabled || isLoading) {
            event.preventDefault();
            return;
          }
          onClick?.(event);
        }}
        aria-disabled={disabled || isLoading || undefined}
        {...rest}
      >
        {content}
      </Link>
    </ButtonUI>
  );
};

export default Button;
export { shellVariants as buttonShellVariants };
export type { ButtonTone, ButtonScale };
