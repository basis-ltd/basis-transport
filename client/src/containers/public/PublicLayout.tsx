import { ReactNode } from 'react';

interface PublicLayoutProps {
  children: ReactNode;
}

const PublicLayout = ({ children }: PublicLayoutProps) => {
  return (
    <main className="landing-page min-h-screen bg-white">
      {children}
    </main>
  );
};

export default PublicLayout;
