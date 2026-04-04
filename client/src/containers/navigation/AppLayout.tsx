import type { CSSProperties, FC, ReactNode } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { closeMobileSidebar } from '@/states/slices/sidebarSlice';
import { useAppDispatch, useAppSelector } from '@/states/hooks';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: FC<AppLayoutProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { desktopExpanded, mobileOpen } = useAppSelector(
    (state) => state.sidebar,
  );

  const layoutVariables = {
    '--navbar-height': '55px',
    '--desktop-sidebar-expanded-width': 'clamp(220px, 18vw, 260px)',
    '--desktop-sidebar-collapsed-width': 'clamp(60px, 12vw, 80px)',
    '--mobile-sidebar-width': 'min(82vw, 320px)',
    '--app-sidebar-width': desktopExpanded
      ? 'var(--desktop-sidebar-expanded-width)'
      : 'var(--desktop-sidebar-collapsed-width)',
  } as CSSProperties & Record<string, string>;

  const sectionClasses = [
    'absolute left-2 right-2 top-[var(--navbar-height)] mt-2',
    'h-fit max-h-[91vh] min-h-0 overflow-y-auto',
    'rounded-md bg-white px-6 py-6 shadow-sm transition-all duration-300 ease-in-out',
    'md:left-[calc(var(--app-sidebar-width)+0.75rem)] md:right-4 md:w-auto md:px-12',
  ].join(' ');

  return (
    <main
      className="relative min-h-screen overflow-x-hidden bg-background"
      style={layoutVariables}
    >
      <Navbar />
      <Sidebar />
      {mobileOpen && (
        <aside
          className="fixed inset-x-0 bottom-0 top-[var(--navbar-height)] z-30 bg-black/50 md:hidden"
          onClick={() => {
            dispatch(closeMobileSidebar());
          }}
          aria-hidden="true"
        />
      )}
      <section className={sectionClasses}>{children}</section>
    </main>
  );
};

export default AppLayout;
