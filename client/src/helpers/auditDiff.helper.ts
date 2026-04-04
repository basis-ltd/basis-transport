/** Keys hidden from audit diffs (entity metadata / system fields). */
export const DEFAULT_SYSTEM_AUDIT_KEYS: readonly string[] = [
  'id',
  'createdAt',
  'updatedAt',
  'createdById',
  'updatedById',
  'deletedAt',
];

export interface AuditFieldChange {
  key: string;
  /** `null` when the field was added (no prior value). */
  oldFormatted: string | null;
  /** `null` when the field was removed (no new value). */
  newFormatted: string | null;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * True when oldValues is a non-array object with at least one own key (CREATE uses `{}`).
 */
export function hasMeaningfulOldValues(oldValues: unknown): boolean {
  if (!isPlainObject(oldValues)) return false;
  return Object.keys(oldValues).length > 0;
}

/**
 * Deterministic JSON-like string for deep equality of snapshots (sorted object keys).
 */
export function stableStringify(value: unknown): string {
  if (value === undefined) return 'undefined';
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }
  const keys = Object.keys(value as Record<string, unknown>).sort();
  return `{${keys
    .map(
      (k) =>
        `${JSON.stringify(k)}:${stableStringify((value as Record<string, unknown>)[k])}`,
    )
    .join(',')}}`;
}

function formatValueForDiff(value: unknown): string {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return stableStringify(value);
}

/**
 * Build one record per changed key between two entity snapshots (system keys excluded by default).
 */
export function buildAuditFieldChanges(
  oldValues: Record<string, unknown>,
  newValues: Record<string, unknown> | null | undefined,
  excludeKeys: readonly string[] = [],
): AuditFieldChange[] {
  const exclude = new Set([...DEFAULT_SYSTEM_AUDIT_KEYS, ...excludeKeys]);
  const next = newValues && isPlainObject(newValues) ? newValues : {};
  const keys = Array.from(
    new Set([...Object.keys(oldValues), ...Object.keys(next)]),
  ).sort();
  const changes: AuditFieldChange[] = [];

  for (const key of keys) {
    if (exclude.has(key)) continue;
    const hasOld = Object.prototype.hasOwnProperty.call(oldValues, key);
    const hasNew = Object.prototype.hasOwnProperty.call(next, key);
    const oldVal = hasOld ? oldValues[key] : undefined;
    const newVal = hasNew ? next[key] : undefined;

    if (stableStringify(oldVal) === stableStringify(newVal)) continue;

    if (!hasOld && hasNew) {
      changes.push({
        key,
        oldFormatted: null,
        newFormatted: formatValueForDiff(newVal),
      });
      continue;
    }
    if (hasOld && !hasNew) {
      changes.push({
        key,
        oldFormatted: formatValueForDiff(oldVal),
        newFormatted: null,
      });
      continue;
    }
    changes.push({
      key,
      oldFormatted: formatValueForDiff(oldVal),
      newFormatted: formatValueForDiff(newVal),
    });
  }

  return changes;
}
