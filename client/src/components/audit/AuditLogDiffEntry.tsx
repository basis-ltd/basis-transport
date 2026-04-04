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
      className={`w-full flex flex-col gap-2 rounded-md shadow-xs border-[.5px] border-gray-200 bg-white p-3 ${className}`}
    >
      <header className="flex flex-col gap-1 text-[11px] sm:text-sm">
        <p className="font-normal text-[11px] text-primary">
          ACTION: {log.action}
          {log?.entityType && showEntityType ? (
            <span className="font-normal text-gray-600">
              {" "}
              · {log.entityType}
            </span>
          ) : null}
        </p>
        <p className="text-gray-500 text-[11px]">
          {formatDate(new Date(log.createdAt), "DD/MM/YYYY HH:mm:ss")}
          {" · "}
          {actorLabel(log)}
        </p>
      </header>
      <ul
        className="list-none m-0 p-0 grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-mono text-[11px] sm:text-xs leading-relaxed rounded py-1"
        role="log"
      >
        {changes.map((c) => (
          <li key={c.key} className="break-words">
            <span className="font-sans font-normal text-[11px] text-secondary">
              {capitalizeString(c?.key)}
            </span>
            <span className="font-sans font-normal text-[11px] text-gray-500">
              :{" "}
            </span>
            {c.oldFormatted !== null && c.newFormatted !== null ? (
              <>
                <span className="text-red-700 line-through text-[11px]">
                  {c?.oldFormatted}
                </span>
                <span className="font-sans font-normal text-[11px] text-gray-400">
                  {" "}
                  →{" "}
                </span>
                <span className="text-green-700 text-[11px]">
                  {c?.newFormatted}
                </span>
              </>
            ) : c?.oldFormatted !== null ? (
              <span className="text-red-700 line-through">
                {c?.oldFormatted}
              </span>
            ) : (
              <span className="text-green-700">{c?.newFormatted}</span>
            )}
          </li>
        ))}
      </ul>
    </article>
  );
}
