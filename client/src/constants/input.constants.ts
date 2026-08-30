/**
 * The row-actions menu. Actions come in three kinds, and only two of them get
 * color: an ordinary action is ink, a destructive one is red, and one that
 * resolves something is green. A menu of ten identical ink rows made "Delete"
 * exactly as easy to hit as "View details".
 */

const tableActionBase = `flex h-(--control-sm) w-full cursor-pointer items-center gap-2 rounded-(--radius-control) px-2 text-sm transition-[background-color,color] duration-200 ease-(--ease-flat)`;

export const ellipsisHClassName = `inline-flex size-(--control-sm) text-sm bg-(--surface) p-2 px-2 hover:bg-(--surface-hover) border-none cursor-pointer items-center justify-center rounded-(--radius-control) text-(--ink) transition-[background-color] duration-200 ease-(--ease-flat) hover:bg-(--surface) active:shadow-[var(--press-on-paper)_999px_999px_0_inset]`;

/** Navigate, open, copy, edit — anything reversible. */
export const tableActionClassName = `${tableActionBase} text-(--ink) hover:bg-(--surface-hover)`;

/** Delete, reject, cancel — anything the row does not come back from. */
export const tableDangerActionClassName = `${tableActionBase} text-(--danger) hover:bg-(--danger-surface)`;

/** Accept, approve, confirm. */
export const tableApproveActionClassName = `${tableActionBase} text-(--approve) hover:bg-(--approve-surface)`;
