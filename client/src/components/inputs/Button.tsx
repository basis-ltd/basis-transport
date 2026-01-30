import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC, MouseEventHandler, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Loader from './Loader';

interface ButtonProps {
  route?: string;
  value?: ReactNode;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  type?: 'submit' | 'button' | 'reset';
  disabled?: boolean;
  primary?: boolean;
  styled?: boolean;
  className?: string;
  submit?: boolean;
  danger?: boolean;
  icon?: IconProp;
  isLoading?: boolean;
  children?: ReactNode;
}

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
  icon = undefined,
  isLoading = false,
  children,
}) => {
  const baseStyles = `py-[10px] flex items-center gap-2 justify-center text-center border border-primary/20 px-5 rounded-lg text-[14px] text-primary bg-white hover:bg-primary/10 hover:text-primary cursor-pointer ease-in-out duration-200 hover:scale-[1.01] shadow-sm
    sm:text-[13px] md:text-[14px] lg:text-[14px]
    sm:py-[8px] md:py-[10px]
    sm:px-4 md:px-5 lg:px-6
    sm:gap-1 md:gap-2 lg:gap-2
    ${
      !styled &&
      'bg-transparent! shadow-none! text-primary! hover:scale-[1.01]! py-0! px-0! border-none! hover:bg-transparent! hover:text-primary!'
    }
    ${className}
    ${
      primary &&
      'bg-primary! text-white! hover:bg-primary! hover:text-white! shadow-sm!'
    }
    ${
      danger &&
      'bg-red-700! border-none! text-white! hover:bg-red-700! hover:text-white! shadow-sm!'
    }
    ${
      disabled &&
      'bg-secondary! shadow-none! hover:scale-[1]! cursor-default! hover:bg-secondary! hover:text-opacity-80 duration-0! text-white text-opacity-80 border-none! text-center transition-all'
    }`;

  if (submit || type === 'submit') {
    return (
      <button
        type={type || 'submit'}
        onClick={onClick as MouseEventHandler<HTMLButtonElement> | undefined}
        className={baseStyles}
        disabled={disabled}
      >
        {isLoading ? (
          <Loader className={primary ? 'text-white' : 'text-primary'} />
        ) : (
          <>
            {icon && (
              <FontAwesomeIcon
                icon={icon}
                className="sm:text-[11px] md:text-[12px] lg:text-[13px]"
              />
            )}
            {children || value}
          </>
        )}
      </button>
    );
  }

  return (
    <Link
      to={route}
      onClick={(e) => {
        if (disabled) {
          e.preventDefault();
          return;
        }
        if (onClick) {
          onClick(e);
        }
      }}
      className={baseStyles}
    >
      {isLoading ? (
        <Loader className={primary ? 'text-white' : 'text-primary'} />
      ) : (
        <>
          {icon && (
            <FontAwesomeIcon
              icon={icon}
              className="sm:text-[11px] md:text-[12px] lg:text-[13px]"
            />
          )}
          {children || value}
        </>
      )}
    </Link>
  );
};

export default Button;
