/**
 * The control contract. Every field in the app — text, search, select, phone,
 * textarea, date trigger — is the same control wearing a different interior,
 * so the strings that describe it live here once instead of being re-typed per
 * component. Input, Select, and TextArea had each grown their own copy and had
 * already drifted apart on height, border colour, and type size.
 */

/** Height, radius, type size, and the four-state edge every control shares. */
export const controlClassName =
  'h-(--control-md) w-full min-w-0 rounded-(--radius-control) border border-(--line) bg-(--paper) px-3.5 text-sm font-normal text-(--ink) outline-none transition-[border-color,box-shadow] duration-200 ease-(--ease-flat) placeholder:text-sm placeholder:text-(--muted) hover:border-(--line-strong) focus:border-(--ink) focus:shadow-[var(--ink)_0_0_0_1px_inset] focus-visible:border-(--ink) focus-visible:shadow-[var(--ink)_0_0_0_1px_inset] aria-invalid:border-(--danger) aria-invalid:shadow-[var(--danger)_0_0_0_1px_inset] disabled:cursor-not-allowed disabled:border-(--line) disabled:bg-(--surface) disabled:text-(--disabled-fg)';

/**
 * A field that only reports a value drops its edge entirely rather than
 * dimming it — a greyed-out border still reads as a control you failed to use.
 */
export const readOnlyControlClassName =
  'cursor-default border-transparent bg-(--surface) text-(--disabled-fg) hover:border-transparent focus:border-transparent focus:shadow-none';

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

/** A textarea is the same control with its height released. */
export const textareaClassName = controlClassName
  .replace('h-(--control-md)', 'min-h-24 py-2.5')
  .replace('placeholder:text-sm ', '');
