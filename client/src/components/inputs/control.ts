/**
 * The control contract.
 *
 * `components/ui/*` stays stock shadcn — it is upgraded from the registry and
 * must not be hand-edited. Every design decision this app makes about a form
 * control lives here instead, and the shells in this folder apply it. That is
 * the only reason a stock `ui/input` and a Peekaboo-looking field can be the
 * same element.
 *
 * Kept free of React so a stylesheet-driven control can read the same values
 * without importing the field layer.
 */

/** Height, radius, type size, and the four-state edge every control shares. */
export const controlClassName =
  'h-(--control-md) w-full min-w-0 rounded-(--radius-control) border border-(--line) bg-(--paper) px-3.5 py-0 text-sm font-normal text-(--ink) shadow-none outline-none transition-[border-color,box-shadow] duration-200 ease-(--ease-flat) placeholder:text-sm placeholder:text-(--muted) hover:border-(--line-strong) focus-visible:border-(--ink) focus-visible:ring-0 focus-visible:shadow-[var(--ink)_0_0_0_1px_inset] aria-invalid:border-(--danger) aria-invalid:ring-0 aria-invalid:shadow-[var(--danger)_0_0_0_1px_inset] disabled:cursor-not-allowed disabled:border-(--line) disabled:bg-(--surface) disabled:text-(--disabled-fg)';

/**
 * A field that only reports a value drops its edge entirely rather than
 * dimming it — a greyed-out border still reads as a control you failed to use.
 */
export const readOnlyControlClassName =
  'cursor-default border-transparent bg-(--surface) text-(--disabled-fg) hover:border-transparent focus-visible:border-transparent focus-visible:shadow-none';

/** Input embedded inside a composite control — the shell owns the edge and focus. */
export const nestedControlInputClassName =
  'h-12 min-h-12 flex-1 border-0 bg-transparent px-0 shadow-none outline-none focus-visible:border-0 focus-visible:shadow-none focus-visible:ring-0 focus-visible:outline-none';

/** A textarea is the same control with its height released. */
export const textareaClassName =
  'min-h-24 w-full min-w-0 rounded-(--radius-control) border border-(--line) bg-(--paper) px-3.5 py-2.5 text-sm font-normal text-(--ink) shadow-none outline-none transition-[border-color,box-shadow] duration-200 ease-(--ease-flat) placeholder:text-(--muted) hover:border-(--line-strong) focus-visible:border-(--ink) focus-visible:ring-0 focus-visible:shadow-[var(--ink)_0_0_0_1px_inset] aria-invalid:border-(--danger) aria-invalid:ring-0 aria-invalid:shadow-[var(--danger)_0_0_0_1px_inset] disabled:cursor-not-allowed disabled:bg-(--surface) disabled:text-(--disabled-fg)';

/** Label, control, and message stack as one column at a fixed rhythm. */
export const fieldClassName = 'flex w-full flex-col gap-1.5';

export const fieldLabelClassName = 'field-label flex items-center gap-1';

/** Helper text under a control. Replaced by the error when there is one. */
export const fieldHelpClassName = 'type-meta';

/**
 * Invalid is the one place a field is allowed colour. The icon stays anyway:
 * colour alone must never be the only carrier of a message, and a red edge on
 * its own says something is wrong without saying what.
 */
export const fieldErrorClassName =
  'flex items-start gap-1.5 text-[0.8125rem] leading-[1.4] text-(--danger)';

/**
 * Every panel in the app — select, dropdown, combobox, date picker — is this
 * one treatment. A borderless panel on `--surface` is a second design system.
 */
export const panelClassName =
  'rounded-(--radius-control) border border-(--line) bg-(--paper) p-1 text-(--ink) shadow-(--shadow-menu)';

/** Compact wayfinding chip — surface fill, smaller type, no ink border. */
export const breadcrumbControlClassName =
  'inline-flex w-fit items-center gap-1.5 rounded-(--radius-control) border border-transparent bg-(--surface) px-4 py-2 text-[0.8125rem] font-normal leading-snug text-(--ink) transition-[background-color,color,border-color,box-shadow] duration-200 ease-(--ease-flat) hover:border-(--line) hover:bg-(--surface-hover) focus-visible:border-(--ink) focus-visible:shadow-[var(--paper)_0_0_0_2px_inset,var(--ink)_0_0_0_2px]';

/** Menu rows are full-width and sit on the small control height. */
export const panelItemClassName =
  'flex h-(--control-sm) w-full cursor-pointer select-none items-center gap-2 rounded-(--radius-control) px-3 text-sm font-normal outline-none transition-colors duration-200 ease-(--ease-flat) data-[highlighted]:bg-(--surface-hover) data-[selected=true]:bg-(--surface-hover) aria-selected:bg-(--ink) hover:text-(--ink) aria-selected:text-(--paper) aria-selected:hover:text-(--ink) data-[disabled]:pointer-events-none data-[disabled]:opacity-50';
