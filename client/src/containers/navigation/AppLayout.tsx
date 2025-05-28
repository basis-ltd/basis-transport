import { RootState, AppDispatch } from '@/states/store';
import { FC, ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { setIsOpen } from '@/states/slices/sidebarSlice';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: FC<AppLayoutProps> = ({ children }) => {
  // STATE VARIABLES
  const { isOpen: isSidebarOpen } = useSelector(
    (state: RootState) => state.sidebar
  );
  const dispatch: AppDispatch = useDispatch();

  const sectionClasses = [
    'absolute top-[9vh] left-0',
    'h-[89.5vh]',
    'px-8 py-6 mt-2 rounded-lg',
    'transition-all duration-300 ease-in-out bg-white',
    isSidebarOpen
      ? 'ml-[60vw] md:ml-[20vw] w-[calc(100vw-20.5vw)]'
      : 'ml-[10vw] md:ml-[5vw] w-[calc(100vw-5.5vw)]',
  ].join(' ');

  return (
    <main className="relative">
      <Navbar />
      <Sidebar />
      {isSidebarOpen && (
        <aside
          className="fixed inset-0 top-0 left-0 bg-black/50 z-[998] md:hidden"
          onClick={(e) => {
            e.stopPropagation();
            dispatch(setIsOpen(false));
          }}
          aria-hidden="true"
        />
      )}
      <section className={sectionClasses}>{children}</section>
    </main>
  );
};

export default AppLayout;
