import { MouseEventHandler, ReactNode } from 'react';
import { Link, To } from 'react-router-dom';
import Loader from './Loader';

interface ButtonProps {
  children: ReactNode;
  className?: string;
  to?: To;
  type?: 'button' | 'submit' | 'reset';
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  isLoading?: boolean;
  primary?: boolean;
  danger?: boolean;
  variant?: 'primary' | 'danger' | 'secondary' | 'outline';
}

const Button = ({
  children,
  className,
  to,
  type,
  onClick,
  isLoading,
  variant = 'primary',
}: ButtonProps) => {

  let variantClasses = '';

  switch (variant) {
    case 'primary':
      variantClasses = '!bg-primary text-white';
      break;
    case 'danger':
      variantClasses = '!bg-red-700 text-white';
      break;
    case 'secondary':
      variantClasses = 'bg-white text-primary';
      break;
    case 'outline':
      variantClasses = 'bg-white text-primary border border-primary';
      break;
    default:
      variantClasses = 'bg-white text-primary';
  }

  if (type && ['submit', 'reset'].includes(type)) {
    return (
      <button
        type={type}
        className={`${variantClasses} inline-flex items-center justify-center cursor-pointer px-4 py-2 text-sm font-normal text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 transition-colors duration-200 ${className}`}
      >
        {isLoading ? <Loader className="text-white" /> : children}
      </button>
    );
  }

  return (
    <Link
      to={to || ''}
      onClick={onClick}
      className={`${variantClasses} inline-flex items-center justify-center cursor-pointer px-4 py-2 text-sm font-normal text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 transition-colors duration-200 ${className}`}
    >
      {isLoading ? <Loader className="text-white" /> : children}
    </Link>
  );
};

export default Button;
