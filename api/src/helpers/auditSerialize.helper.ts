/** Max JSON size for entity / snapshot payloads stored in audit_logs (chars). */
export const AUDIT_JSON_MAX_CHARS = 32_000;

const SENSITIVE_KEYS = new Set(
  [
    'password',
    'passwordhash',
    'password_hash',
    'passwordHash',
    'token',
    'refreshtoken',
    'refresh_token',
    'authorization',
    'secret',
    'apikey',
    'api_key',
    'creditcard',
    'credit_card',
    'currentpassword',
    'newpassword',
    'resettoken',
    'reset_token',
  ].map((k) => k.toLowerCase())
);

function isSensitiveKey(key: string): boolean {
  const lower = key.toLowerCase();
  if (SENSITIVE_KEYS.has(lower)) {
    return true;
  }
  return lower.includes('password') || lower.includes('token');
}

/**
 * Deep-clone plain objects/arrays and replace sensitive keys with [REDACTED].
 */
export function redactForAudit(value: unknown, depth = 0): unknown {
  if (depth > 12) {
    return '[MaxDepth]';
  }
  if (value === null || value === undefined) {
    return value;
  }
  if (typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((v) => redactForAudit(v, depth + 1));
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (isSensitiveKey(k)) {
      out[k] = '[REDACTED]';
    } else {
      out[k] = redactForAudit(v, depth + 1);
    }
  }
  return out;
}

/**
 * Safe snapshot for TypeORM entities / POJOs: plain data, no circular refs, size-capped.
 */
export function serializeEntityForAudit(entity: unknown): Record<string, unknown> {
  const plain =
    entity && typeof entity === 'object'
      ? JSON.parse(
          JSON.stringify(entity, (_key, val) => {
            if (typeof val === 'function' || typeof val === 'symbol') {
              return undefined;
            }
            return val;
          })
        )
      : {};
  const redacted = redactForAudit(plain) as Record<string, unknown>;
  let s = JSON.stringify(redacted);
  if (s.length > AUDIT_JSON_MAX_CHARS) {
    return {
      _truncated: true,
      _originalLength: s.length,
      preview: s.slice(0, AUDIT_JSON_MAX_CHARS),
    };
  }
  return redacted;
}
