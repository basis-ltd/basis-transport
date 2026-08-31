import type { PatternService } from './network.types';

const TZ = 'Africa/Kigali';

export function kigaliDate(date: Date): string {
  return serviceDateAt(date.getTime(), TZ);
}

export function serviceDateAt(epoch: number, timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(epoch));
  const get = (key: string) => parts.find((p) => p.type === key)!.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/** GTFS service day: local noon minus twelve elapsed hours (including DST). */
export function serviceDayStart(date: string, timezone: string): number {
  const noon = Date.parse(`${date}T12:00:00Z`);
  let epoch = noon;
  for (let i = 0; i < 3; i++) {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date(epoch));
    const get = (key: string) => parts.find((p) => p.type === key)!.value;
    const wall = Date.parse(
      `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}Z`
    );
    epoch += noon - wall;
  }
  return epoch - 12 * 3600000;
}

const weekdayMap = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
} as const;

export function kigaliWeekday(date: Date): number {
  const name = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    weekday: 'short',
  }).format(date);
  return weekdayMap[name as keyof typeof weekdayMap] ?? 0;
}

export function kigaliSecondsSinceMidnight(date: Date): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value || 0);
  return get('hour') * 3600 + get('minute') * 60 + get('second');
}

export function serviceRunsOnDate(
  service: PatternService,
  date: string
): boolean {
  const exception = service.exceptions.find((e) => e.date === date);
  if (exception) return exception.added;
  if (date < service.validFrom || date > service.validTo) return false;
  const weekday = (new Date(`${date}T12:00:00Z`).getUTCDay() + 6) % 7;
  return service.weekdays[weekday] ?? false;
}

/** Returns false when outside calendar, true when inside a frequency window, null when windows are absent. */
export function serviceActiveAtTime(
  service: PatternService,
  date: string,
  seconds: number
): boolean | null {
  if (!serviceRunsOnDate(service, date)) return false;
  if (!service.windows.length) return null;
  return service.windows.some(
    (w) => seconds >= w.startSeconds && seconds <= w.endSeconds
  );
}
