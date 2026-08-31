import type { ComponentProps } from 'react';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

type BackButtonProps = Pick<
  ComponentProps<typeof Button>,
  'children' | 'className' | 'route' | 'onClick'
>;

/**
 * Shared breadcrumb control for a parent route, a local view, or browser history.
 */
const BackButton = ({
  children = 'Back',
  className,
  route,
  onClick,
}: BackButtonProps) => {
  const navigate = useNavigate();

  return (
    <Button
      type={route ? null : 'button'}
      variant="breadcrumb"
      icon={faArrowLeft}
      className={className}
      route={route}
      onClick={onClick ?? (route ? undefined : () => navigate(-1))}
    >
      {children}
    </Button>
  );
};

export default BackButton;
