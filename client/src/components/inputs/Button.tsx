import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cva, type VariantProps } from 'class-variance-authority';
import { FC, MouseEventHandler, ReactNode, HTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button as ButtonUI } from '../ui/button';
import { Spinner } from '../ui/spinner';

/**
 * Two variants, and only two.
 *
 * `primary` is the one thing this screen wants you to do; `outline` is
 * everything else. `ghost`, `secondary`, and especially `link` were three ways
 * of saying "not primary", which meant the same action rendered differently on
 * different pages and no rung of the hierarchy meant anything. A text link
 * belongs in prose and is an `<a>` — it was never a button.
 *
 * `ui/button` stays stock; the whole visual contract lives here.
 */
const shellVariants = cva(
  [
    'cursor-pointer font-medium rounded-(--radius-control)',
    'transition-[background-color,color,border-color,box-shadow]',
    'duration-200 ease-(--ease-flat) shadow-none outline-none',
    /* Focus is an inner ring in the ground colour and an outer ring in the ink
       colour — legible on any surface, in either theme, with zero hue. */
    'focus-visible:ring-0 focus-visible:border-(--ink)',
    'focus-visible:shadow-[var(--paper)_0_0_0_2px_inset,var(--ink)_0_0_0_2px]',
    'disabled:pointer-events-none disabled:opacity-40',
  ].join(' '),
  {
    variants: {
      tone: {
        /* Press is a full-surface inset flood: a 999px inset spread covers the
           control whatever its size. Never a transform — a scale fights the
           flood and wins, which makes the flood invisible. */
        primary:
          'bg-(--ink) text-(--paper) border border-(--ink) hover:bg-[color-mix(in_oklab,var(--ink)_88%,var(--paper))] hover:border-[color-mix(in_oklab,var(--ink)_88%,var(--paper))] active:shadow-[var(--press-on-ink)_999px_999px_0_inset]',
        /* An outline that flips to a solid ink fill on hover is a primary
           button in disguise, and it takes any child icon with a fixed colour
           down to invisible. The border and the label keep their colour. */
        outline:
          'bg-transparent text-(--ink) border border-(--ink) hover:bg-(--surface) active:shadow-[var(--press-on-paper)_999px_999px_0_inset]',
      },
      /* The control tokens, not free numbers. Text stays 14px at every size —
         `lg` is a taller target, not louder type. */
      scale: {
        sm: 'h-(--control-sm) px-3.5 text-sm',
        default: 'h-(--control-md) px-4 text-sm',
        lg: 'h-(--control-lg) px-6 text-sm',
        icon: 'size-(--control-md) px-0',
        'icon-sm': 'size-(--control-sm) px-0',
      },
    },
    defaultVariants: { tone: 'outline', scale: 'default' },
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
  const classes = cn(shellVariants({ tone, scale: size }), className);

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
