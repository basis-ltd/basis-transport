import { ReactNode } from 'react';
import { publicColors } from './publicTheme';

interface PublicLayoutProps {
  children: ReactNode;
}

const PublicLayout = ({ children }: PublicLayoutProps) => {
  return (
    <main className="min-h-screen" style={{ backgroundColor: publicColors.bg }}>
      {children}
    </main>
  );
};

export default PublicLayout;
