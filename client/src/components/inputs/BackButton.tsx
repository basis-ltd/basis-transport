import type { ReactNode } from 'react';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

interface BackButtonProps {
  children?: ReactNode;
  className?: string;
}

/**
 * Wayfinding back control — breadcrumb tone, arrow icon, browser history.
 */
const BackButton = ({
  children = 'Back',
  className,
}: BackButtonProps) => {
  const navigate = useNavigate();

  return (
    <Button
      type="button"
      variant="breadcrumb"
      icon={faArrowLeft}
      className={className}
      onClick={() => navigate(-1)}
    >
      {children}
    </Button>
  );
};

export default BackButton;
