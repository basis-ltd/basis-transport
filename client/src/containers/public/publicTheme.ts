/**
 * The public / marketing surface, expressed as the global tokens.
 *
 * This file used to be a second design system: raw hexes, `!important`
 * overrides that outranked (and silently killed) the primitives' own hover and
 * focus styles, `hover:scale`, and a 12px type scale that sat below the
 * legibility floor. Everything here now composes `index.css` tokens and the
 * shared type utilities, so light/dark and the app layer move together and
 * there is one source of truth for a colour.
 *
 * `var()` works inside an inline `style`, which is what keeps the ~80 existing
 * `style={{ color: publicColors.x }}` call sites theme-aware for free.
 */
export const publicColors = {
  primary: 'var(--ink)',
  primaryLight: 'var(--muted)',
  primaryLighter: 'var(--muted-weak)',
  ink: 'var(--ink)',
  inkMuted: 'var(--muted)',
  inkSubtle: 'var(--muted-weak)',
  neutral: 'var(--ink)',
  neutralLight: 'var(--muted)',
  neutralLighter: 'var(--muted-weak)',
  surface: 'var(--surface)',
  surfaceAlt: 'var(--surface-hover)',
  bg: 'var(--paper)',
  bgAlt: 'var(--surface)',
  white: 'var(--paper)',
  border: 'var(--line)',
} as const;

export const publicClasses = {
  authCard:
    'w-full max-w-[420px] card-framed p-8 mx-auto flex flex-col gap-4 animate-fade-in-up',
  section: 'py-10 md:py-12 lg:py-14',
  container: 'max-w-4xl mx-auto px-5 sm:px-8 lg:px-10',
  containerWide: 'max-w-6xl mx-auto px-5 sm:px-8 lg:px-10',
  containerNarrow: 'max-w-3xl mx-auto px-5 sm:px-8 lg:px-10',
  /* Hierarchy comes from size, spacing, and colour — never a weight jump.
     400 is the default and 500 is the ceiling; 12px is the floor. */
  pageTitle: 'type-h3 text-(--ink)',
  sectionTitle: 'type-card-title text-(--ink)',
  cardTitle: 'type-card-title text-(--ink)',
  eyebrow: 'type-eyebrow',
  body: 'type-body-sm text-(--ink)',
  bodyMuted: 'type-body-sm text-(--muted)',
  statValue: 'type-metric text-(--ink)',
  landingHeroDisplay: 'type-display text-(--ink)',
  landingHeroBody: 'type-body text-(--muted) max-w-[46ch]',
  landingSectionTitle: 'type-h2 text-(--ink)',
  landingCardTitle: 'type-h3 text-(--ink)',
  landingBody: 'type-body text-(--muted)',
  landingMeta: 'type-meta',
  /* The hero is sized by its content everywhere except here, where the brief
     is an explicit full-viewport first screen. */
  heroShell: 'w-full min-h-[calc(100svh-4rem)] flex items-center justify-center',
  heroGrid:
    'grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] lg:gap-16',
  card: 'card-framed p-5',
  /* Selection is a swap, not a tint. */
  tabSelected: 'bg-(--ink) text-(--paper)',
  tabUnselected: 'bg-(--surface) text-(--ink) hover:bg-(--surface-hover)',
  tabBase:
    'h-(--control-md) rounded-(--radius-control) text-sm font-medium cursor-pointer transition-colors duration-200 ease-(--ease-flat) flex items-center justify-center',
} as const;
