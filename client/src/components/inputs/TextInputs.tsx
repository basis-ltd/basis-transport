import { SkeletonLoader } from './Loader';

interface HeadingProps {
  children: React.ReactNode;
  className?: string;
  type?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  isLoading?: boolean;
}

export const Heading = ({
  children,
  className,
  type = 'h1',
  isLoading,
}: HeadingProps) => {
  switch (type) {
    case 'h1':
      return (
        <h1 className={`text-xl font-semibold text-primary ${className}`}>
          {isLoading ? <SkeletonLoader type="text" width="20vw" /> : children}
        </h1>
      );
    case 'h2':
      return (
        <h2 className={`text-lg font-semibold text-primary ${className}`}>
          {isLoading ? <SkeletonLoader type="text" width="15vw" /> : children}
        </h2>
      );
    case 'h3':
      return (
        <h3 className={`text-base font-semibold text-primary ${className}`}>
          {isLoading ? <SkeletonLoader type="text" width="15vw" /> : children}
        </h3>
      );
    case 'h4':
      return (
        <h4 className={`text-sm font-semibold text-primary ${className}`}>
          {isLoading ? <SkeletonLoader type="text" width="15vw" /> : children}
        </h4>
      );
    case 'h5':
      return (
        <h5 className={`text-xs font-semibold text-primary ${className}`}>
          {isLoading ? <SkeletonLoader type="text" width="15vw" /> : children}
        </h5>
      );
    case 'h6':
      return (
        <h6 className={`text-xs font-semibold text-primary ${className}`}>
          {isLoading ? <SkeletonLoader type="text" width="15vw" /> : children}
        </h6>
      );
    default:
      return (
        <h1 className={`text-xl font-semibold text-primary ${className}`}>
          {isLoading ? <SkeletonLoader type="text" width="20vw" /> : children}
        </h1>
      );
  }
};
