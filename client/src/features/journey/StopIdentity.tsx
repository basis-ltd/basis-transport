import type { NetworkStop } from "./types";

export default function StopIdentity({ stop }: { stop: NetworkStop }) {
  const names = Object.entries(stop.displayNames ?? {});
  return (
    <>
      {stop.platformCode && (
        <p className="journey-review-path">
          Boarding point {stop.platformCode}
        </p>
      )}
      {(names.length > 0 || stop.sourceRecord) && (
        <details className="journey-data-notes">
          <summary>Stop names and source</summary>
          {names.length > 0 && (
            <dl className="journey-stop-names">
              {names.map(([language, name]) => (
                <div key={language}>
                  <dt>{language}</dt>
                  <dd lang={language}>{name}</dd>
                </div>
              ))}
            </dl>
          )}
          {stop.sourceRecord && (
            <p className="journey-field-hint journey-source-record">
              Source record: {stop.sourceRecord.namespace} /{" "}
              {stop.sourceRecord.file} / {stop.sourceRecord.recordId}. This
              identifies the imported record, not current service verification.
            </p>
          )}
        </details>
      )}
    </>
  );
}
