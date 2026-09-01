const PERSONAL_RETURN =
  /^\/(saved|travel|admin\/network|account\/profile|users|stops|routes)(\/|\?|$)/;

export function isSafeReturnTo(
  value: string | null | undefined,
): value is string {
  return Boolean(
    value &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\") &&
    PERSONAL_RETURN.test(value),
  );
}

export function loginUrl(returnTo?: string) {
  if (!isSafeReturnTo(returnTo)) return "/auth/login";
  return `/auth/login?returnTo=${encodeURIComponent(returnTo)}`;
}
