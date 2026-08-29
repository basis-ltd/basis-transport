import { SkeletonLoader } from './Loader';

interface HeadingProps {
  children: React.ReactNode;
  className?: string;
  type?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  isLoading?: boolean;
}

/**
 * Headings compose a type utility rather than a size, so a scale change is one
 * edit in index.css rather than three hundred call sites. Every level used to
 * spell out its own `text-[15px] font-normal text-primary/80`, which is why
 * three of the six were identical and call sites had to shout with
 * `!text-[13px]` to get anything else.
 */
const headingClassName = {
  h1: 'type-h2',
  h2: 'type-h3',
  h3: 'type-card-title',
  h4: 'type-card-title',
  h5: 'type-label',
  h6: 'type-label',
} as const;

const skeletonWidth = {
  h1: '20vw',
  h2: '15vw',
  h3: '15vw',
  h4: '15vw',
  h5: '15vw',
  h6: '15vw',
} as const;

export const Heading = ({
  children,
  className,
  type = 'h3',
  isLoading,
}: HeadingProps) => {
  const Tag = type;
  const body = isLoading ? (
    <SkeletonLoader type="text" width={skeletonWidth[type]} />
  ) : (
    children
  );

  return (
    <Tag className={`${headingClassName[type]} text-(--ink) ${className ?? ''}`}>
      {body}
    </Tag>
  );
};
