import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC, MouseEventHandler, ReactNode, HTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button as ButtonUI } from '../ui/button';
import Loader from './Loader';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'link'
  | 'danger'
  | 'approve';

interface ButtonProps
  extends Omit<HTMLAttributes<HTMLButtonElement | HTMLAnchorElement>, 'onClick'> {
  route?: string;
  value?: ReactNode;
  onClick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
  type?: 'submit' | 'button' | 'reset' | null;
  disabled?: boolean;
  /** Shorthand for variant="primary". */
  primary?: boolean;
  submit?: boolean;
  /** Shorthand for variant="danger". */
  danger?: boolean;
  /** Shorthand for variant="approve". */
  approve?: boolean;
  /** Legacy escape hatch: renders the bare link variant. */
  styled?: boolean;
  icon?: IconProp;
  isLoading?: boolean;
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: 'sm' | 'default' | 'lg' | 'icon' | 'icon-sm';
  /** Associates a submit button with a form by id when rendered outside it. */
  form?: string;
}

/**
 * This wrapper adds routing, loading, and a FontAwesome icon slot. Everything
 * visual comes from ui/button so there is exactly one button in the app — this
 * file used to re-declare the whole style string, which is how it drifted into
 * its own border colour, its own height, and a hover scale the primitive never
 * had.
 */
const uiVariant = {
  primary: 'default',
  secondary: 'secondary',
  outline: 'outline',
  ghost: 'ghost',
  link: 'link',
  danger: 'destructive',
  approve: 'approve',
} as const;

const Button: FC<ButtonProps> = ({
  route = '#',
  value,
  onClick,
  type = null,
  disabled = false,
  primary = false,
  styled = true,
  className,
  submit = false,
  danger = false,
  approve = false,
  icon,
  isLoading = false,
  children,
  variant,
  size = 'default',
  ...rest
}) => {
  const resolved: ButtonVariant =
    variant ??
    (!styled
      ? 'link'
      : danger
        ? 'danger'
        : approve
          ? 'approve'
          : primary
            ? 'primary'
            : 'outline');

  const content = isLoading ? (
    <Loader />
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
        variant={uiVariant[resolved]}
        size={size}
        onClick={onClick as MouseEventHandler<HTMLButtonElement> | undefined}
        className={cn(className)}
        disabled={disabled || isLoading}
        {...rest}
      >
        {content}
      </ButtonUI>
    );
  }

  return (
    <ButtonUI
      asChild
      variant={uiVariant[resolved]}
      size={size}
      className={cn(className)}
      disabled={disabled || isLoading}
    >
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
