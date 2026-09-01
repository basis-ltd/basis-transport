import type { CSSProperties, FC, ReactNode } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { closeMobileSidebar } from "@/states/slices/sidebarSlice";
import { useAppDispatch, useAppSelector } from "@/states/hooks";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: FC<AppLayoutProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { desktopExpanded, mobileOpen } = useAppSelector(
    (state) => state.sidebar,
  );

  const layoutVariables = {
    "--navbar-height": "55px",
    "--desktop-sidebar-expanded-width": "clamp(220px, 18vw, 260px)",
    "--desktop-sidebar-collapsed-width": "clamp(60px, 12vw, 80px)",
    "--mobile-sidebar-width": "min(82vw, 320px)",
    "--app-sidebar-width": desktopExpanded
      ? "var(--desktop-sidebar-expanded-width)"
      : "var(--desktop-sidebar-collapsed-width)",
  } as CSSProperties & Record<string, string>;

  const sectionClasses = [
    "min-h-[calc(100vh-var(--navbar-height))] w-full bg-(--surface)",
    "px-5 py-7 sm:px-7 sm:py-8 md:ml-[var(--app-sidebar-width)]",
    "md:w-[calc(100%-var(--app-sidebar-width))] md:px-10 lg:px-12",
    "transition-[margin,width,padding] duration-300 ease-in-out",
  ].join(" ");

  return (
    <div
      className="relative min-h-screen overflow-x-hidden bg-(--surface) pt-[var(--navbar-height)]"
      style={layoutVariables}
    >
      <Navbar />
      <Sidebar />
      {mobileOpen && (
        <aside
          className="fixed inset-x-0 bottom-0 top-[var(--navbar-height)] z-(--z-sidebar-scrim) bg-(--overlay) md:hidden"
          onClick={() => {
            dispatch(closeMobileSidebar());
          }}
          aria-hidden="true"
        />
      )}
      <section className={sectionClasses} data-app-pane>
        {children}
      </section>
    </div>
  );
};

export default AppLayout;
