import { ReactNode } from 'react';

interface PublicLayoutProps {
  children: ReactNode;
}

const PublicLayout = ({ children }: PublicLayoutProps) => {
  return (
    <div className="landing-page min-h-screen bg-(--paper)">
      {children}
    </div>
  );
};

export default PublicLayout;
