/** Public web origin (no trailing slash), for canonical and Open Graph URLs */
export const publicSiteUrl =
  import.meta.env.VITE_PUBLIC_SITE_URL || 'https://transport.basis.rw';

/** Shared default OG / social preview image (SVG data URI) */
export const defaultOgImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='0.9em' font-size='90'%3E%F0%9F%9A%8C%3C/text%3E%3C/svg%3E";

/** Default favicon (matches previous Helmet blocks) */
export const defaultFaviconHref =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='0.9em' font-size='90'%3E%F0%9F%9A%8C%3C/text%3E%3C/svg%3E";

/**
 * Absolute URL for a path (e.g. `/auth/login` → `https://example.com/auth/login`).
 * Root path `/` yields `origin + /`.
 */
export function absoluteUrl(path: string): string {
  const base = publicSiteUrl.replace(/\/$/, '');
  const normalized =
    path === '' || path === '/'
      ? '/'
      : path.startsWith('/')
        ? path
        : `/${path}`;
  return `${base}${normalized}`;
}
