import type { Coordinates } from './network.types';

export const validCoordinates = (p: unknown): p is Coordinates =>
  Array.isArray(p) &&
  p.length === 2 &&
  p.every((n) => typeof n === 'number' && Number.isFinite(n)) &&
  Math.abs(p[0]) <= 180 &&
  Math.abs(p[1]) <= 90;
export function distance(a: Coordinates, b: Coordinates): number {
  const r = Math.PI / 180;
  const h =
    Math.sin(((b[1] - a[1]) * r) / 2) ** 2 +
    Math.cos(a[1] * r) *
      Math.cos(b[1] * r) *
      Math.sin(((b[0] - a[0]) * r) / 2) ** 2;
  return 6371000 * 2 * Math.asin(Math.sqrt(Math.min(1, h)));
}
export const lineDistance = (points: Coordinates[]) =>
  points.slice(1).reduce((sum, p, i) => sum + distance(points[i], p), 0);
export const normalizeName = (s: string) =>
  s
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
