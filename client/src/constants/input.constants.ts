/**
 * The row-actions menu. Actions come in three kinds, and only two of them get
 * color: an ordinary action is ink, a destructive one is red, and one that
 * resolves something is green. A menu of ten identical ink rows made "Delete"
 * exactly as easy to hit as "View details".
 */

const tableActionBase = `flex h-(--control-sm) w-full cursor-pointer items-center gap-2 rounded-(--radius-control) px-2 text-sm transition-[background-color,color] duration-200 ease-(--ease-flat)`;

/**
 * The trigger for that menu. It is drawn on `--paper` with a real edge rather
 * than a `--surface` fill, because this control appears both inside a card and
 * on the page ground — and a surface-filled chip on the app canvas is two
 * steps of grey apart from it, which is not a control, it is a smudge. It also
 * declared `hover:bg-(--surface-hover)` and then `hover:bg-(--surface)` again
 * further along the same string, so the later one won and the hover did
 * nothing at all.
 */
export const ellipsisHClassName = `inline-flex p-2 px-4 cursor-pointer items-center justify-center rounded-(--radius-control) border border-(--line) bg-(--paper) text-sm text-(--ink) transition-[background-color,border-color] duration-200 ease-(--ease-flat) hover:bg-(--surface) focus-visible:border-(--ink) focus-visible:outline-none focus-visible:shadow-[var(--paper)_0_0_0_2px_inset,var(--ink)_0_0_0_2px] active:shadow-[var(--press-on-paper)_999px_999px_0_inset]`;

/** Navigate, open, copy, edit — anything reversible. */
export const tableActionClassName = `${tableActionBase} text-(--ink) hover:bg-(--surface-hover)`;

/** Delete, reject, cancel — anything the row does not come back from. */
export const tableDangerActionClassName = `${tableActionBase} text-(--danger) hover:bg-(--danger-surface)`;

/** Accept, approve, confirm. */
export const tableApproveActionClassName = `${tableActionBase} text-(--approve) hover:bg-(--approve-surface)`;
