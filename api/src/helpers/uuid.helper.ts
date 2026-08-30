const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Whether a string looks like a UUID. Used by the public network endpoints so a
 * filter can accept either an id or a human handle (corridor code, agency name,
 * route short name).
 */
export const isUuid = (value?: string): boolean =>
  Boolean(value && UUID_PATTERN.test(value));
