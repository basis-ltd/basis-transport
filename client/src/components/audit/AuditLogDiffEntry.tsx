import { AuditFieldChange } from "@/helpers/auditDiff.helper";
import { capitalizeString, formatDate } from "@/helpers/strings.helper";
import { AuditLog } from "@/types/auditLog.entity";

export interface AuditLogDiffEntryProps {
  log: AuditLog;
  changes: AuditFieldChange[];
  className?: string;
  showEntityType?: boolean;
}

function actorLabel(log: AuditLog): string {
  const u = log?.createdBy;
  if (!u) return "Unknown";
  return u.name?.trim() || u.email || "Unknown";
}

export function AuditLogDiffEntry({
  log,
  changes,
  className = "",
  showEntityType = false,
}: AuditLogDiffEntryProps) {
  return (
    <article
      className={`w-full flex flex-col gap-2 rounded-md border-[.5px] border-(--line) bg-(--paper) p-3 ${className}`}
    >
      <header className="flex flex-col gap-1 text-xs sm:text-sm">
        <p className="font-normal text-xs text-(--ink)">
          ACTION: {log.action}
          {log?.entityType && showEntityType ? (
            <span className="font-normal text-(--muted)">
              {" "}
              · {log.entityType}
            </span>
          ) : null}
        </p>
        <p className="text-(--muted) text-xs">
          {formatDate(new Date(log.createdAt), "DD/MM/YYYY HH:mm:ss")}
          {" · "}
          {actorLabel(log)}
        </p>
      </header>
      <ul
        className="list-none m-0 p-0 grid grid-cols-1 sm:grid-cols-2 gap-1.5 tabular text-xs leading-relaxed rounded py-1"
        role="log"
      >
        {changes.map((c) => (
          <li key={c.key} className="break-words">
            <span className="font-sans font-normal text-xs text-(--muted)">
              {capitalizeString(c?.key)}
            </span>
            <span className="font-sans font-normal text-xs text-(--muted)">
              :{" "}
            </span>
            {c.oldFormatted !== null && c.newFormatted !== null ? (
              <>
                <span className="text-(--danger) line-through text-xs">
                  {c?.oldFormatted}
                </span>
                <span className="font-sans font-normal text-xs text-(--muted)">
                  {" "}
                  →{" "}
                </span>
                <span className="text-(--approve) text-xs">
                  {c?.newFormatted}
                </span>
              </>
            ) : c?.oldFormatted !== null ? (
              <span className="text-(--danger) line-through">
                {c?.oldFormatted}
              </span>
            ) : (
              <span className="text-(--approve)">{c?.newFormatted}</span>
            )}
          </li>
        ))}
      </ul>
    </article>
  );
}
