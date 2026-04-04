import { SkeletonLoader } from '@/components/inputs/Loader';
import { AuditLog } from '@/types/auditLog.entity';
import {
  buildAuditFieldChanges,
  hasMeaningfulOldValues,
} from '@/helpers/auditDiff.helper';
import { AuditLogDiffEntry } from './AuditLogDiffEntry';

export interface AuditLogDiffListProps {
  logs: AuditLog[];
  isLoading?: boolean;
  emptyMessage?: string;
  excludeKeys?: string[];
  className?: string;
}

const defaultEmptyMessage = 'No changes to show.';

export function AuditLogDiffList({
  logs,
  isLoading,
  emptyMessage = defaultEmptyMessage,
  excludeKeys = [],
  className = '',
}: AuditLogDiffListProps) {
  if (isLoading) {
    return (
      <div className={`w-full flex flex-col gap-3 ${className}`}>
        <SkeletonLoader type="text" width="40%" />
        <SkeletonLoader type="card" height="6rem" />
        <SkeletonLoader type="card" height="6rem" />
      </div>
    );
  }

  const entries: {
    log: AuditLog;
    changes: ReturnType<typeof buildAuditFieldChanges>;
  }[] = [];

  for (const log of logs) {
    if (!hasMeaningfulOldValues(log.oldValues)) continue;
    const oldValues = log.oldValues as Record<string, unknown>;
    const changes = buildAuditFieldChanges(
      oldValues,
      log.newValues as Record<string, unknown> | undefined,
      excludeKeys,
    );
    if (changes.length === 0) continue;
    entries.push({ log, changes });
  }

  if (entries.length === 0) {
    return (
      <p className={`text-sm text-gray-500 ${className}`}>{emptyMessage}</p>
    );
  }

  return (
    <ul className={`w-full flex flex-col gap-4 ${className}`}>
      {entries.map(({ log, changes }) => (
        <li key={log.id}>
          <AuditLogDiffEntry log={log} changes={changes} />
        </li>
      ))}
    </ul>
  );
}
