import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import basisTransportLogo from '/logo.svg';

/**
 * The auth surface: one quiet ground, one framed card, one column.
 *
 * The six auth screens each used to build their own wrapper out of
 * PublicLayout + PublicNavbar + a stack of `publicClasses` handles, which is
 * how they drifted into six slightly different card widths and heading sizes.
 * Layout lives here; everything visual comes from the same primitives the rest
 * of the app uses.
 */

interface AuthPageShellProps {
  children: ReactNode;
  /**
   * How wide the column may grow. The card fills it, so the width is declared
   * once instead of on both the column and the card, where the two could
   * disagree and silently clamp each other.
   */
  maxWidthClassName?: string;
}

export const AuthPageShell = ({
  children,
  maxWidthClassName = 'max-w-[420px]',
}: AuthPageShellProps) => (
  <main className="grid min-h-screen grid-rows-[auto_minmax(0,1fr)] bg-(--surface) px-5 py-6 text-(--ink)">
    <header className="flex justify-center">
      <Link
        to="/"
        aria-label="Basis Transport home"
        className="inline-flex items-center gap-2.5 rounded-(--radius-pill) px-3 py-1 transition-opacity duration-200 ease-(--ease-flat) hover:opacity-70"
      >
        <img src={basisTransportLogo} alt="" className="size-7" aria-hidden="true" />
        <span className="text-base font-medium">Basis</span>
      </Link>
    </header>

    {/* The form column is the only scroller, so a long form scrolls inside the
        viewport instead of pushing the footer note off it. */}
    <div className="flex items-start justify-center overflow-y-auto py-6">
      <div className={`my-auto w-full ${maxWidthClassName}`}>{children}</div>
    </div>
  </main>
);

export const AuthCard = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) => (
  <section className="card-framed flex w-full flex-col gap-5 p-8 max-sm:p-5">
    <header className="text-center">
      <h1 className="type-h3">{title}</h1>
      {subtitle ? (
        <p className="type-body-sm mt-1 text-(--muted)">{subtitle}</p>
      ) : null}
    </header>
    {children}
  </section>
);

/**
 * Segmented control. Selection is the inversion — the chosen side takes ink as
 * its ground — and it is a real button group, not two anchors to "#" that put
 * dead stops in the tab order.
 */
export const AuthTabs = <T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { label: string; value: T }[];
  label: string;
}) => (
  <div role="tablist" aria-label={label} className="grid grid-cols-2 gap-2">
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        role="tab"
        aria-selected={value === option.value}
        onClick={() => onChange(option.value)}
        className="flex h-(--control-md) cursor-pointer items-center justify-center rounded-(--radius-control) bg-(--surface) text-sm font-medium text-(--ink) transition-colors duration-200 ease-(--ease-flat) hover:bg-(--surface-hover) aria-selected:bg-(--ink) aria-selected:text-(--paper)"
      >
        {option.label}
      </button>
    ))}
  </div>
);

/** The line under the card that hands the reader to the other auth screen. */
export const AuthFooterNote = ({ children }: { children: ReactNode }) => (
  <p className="type-body-sm mt-6 text-center">{children}</p>
);

/**
 * A link inside auth copy carries a standing underline rather than the app's
 * hover sweep: with no colour to spend, a sweep that only appears on hover
 * leaves "Sign up" looking exactly like the words around it.
 */
export const AuthLink = ({
  to,
  children,
}: {
  to: string;
  children: ReactNode;
}) => (
  <Link
    to={to}
    className="font-medium text-(--ink) underline decoration-(--line-strong) underline-offset-[3px] transition-colors duration-200 ease-(--ease-flat) hover:decoration-(--ink)"
  >
    {children}
  </Link>
);

/** A notice states an outcome, so it is the one place auth spends colour. */
export const AuthNotice = ({
  children,
  tone = 'default',
}: {
  children: ReactNode;
  tone?: 'default' | 'success' | 'error';
}) => {
  const toneClassName =
    tone === 'error'
      ? 'border border-(--danger-line) bg-(--danger-surface) text-(--danger)'
      : tone === 'success'
        ? 'border border-(--approve-line) bg-(--approve-surface) text-(--approve)'
        : 'bg-(--surface) text-(--muted)';

  return (
    <p
      aria-live="polite"
      role="status"
      className={`type-body-sm rounded-(--radius-control) px-3 py-2 text-center ${toneClassName}`}
    >
      {children}
    </p>
  );
};
