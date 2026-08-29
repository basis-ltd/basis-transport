import moment from 'moment';

/**
 * Format a number to a string with commas.
 * @param number - The number to format.
 * @returns The formatted number.
 */
export const formatNumbers = (number?: number | string) => {
  if (!number) return '';
  return new Intl.NumberFormat().format(Number(number));
};

/**
 * Capitalize a string.
 * @param string - The string to capitalize.
 * @returns The capitalized string.
 */
export const capitalizeString = (string: string | undefined | null) => {
  if (!string) return '';
  const isCamelCase = /^[a-z]+([A-Z][a-z]*)*$/.test(string);
  if (isCamelCase) return capitalizeCamelCase(string);
  if (string.includes('@')) return string;
  const words = string?.toLowerCase()?.split('_');
  const capitalizedWords =
    words && words.map((word) => word.charAt(0).toUpperCase() + word.slice(1));
  return capitalizedWords && capitalizedWords.join(' ');
};

/**
 * Capitalize a camel case string.
 * @param string - The string to capitalize.
 * @returns The capitalized string.
 */
export function capitalizeCamelCase(string: string) {
  return string
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, function (str) {
      return str.toUpperCase();
    })
    .trim();
}

/**
 * Format a date to a string.
 * @param date - The date to format.
 * @param format - The format to use.
 * @returns The formatted date.
 */
export const formatDate = (
  date: string | Date | undefined,
  format: string = 'YYYY-MM-DD'
) => {
  if (!date) return '';
  return moment(date).format(format);
};

/**
 * Status is carried by shape, fill, and an icon — never by hue alone. A row of
 * saturated chips is unreadable in a greyscale screenshot and says nothing at
 * all to a screen reader, and the previous set (green / red / amber / sky, all
 * at 11px on white) failed both. Every badge still renders its text label; the
 * treatment only reinforces it.
 */
const statusBadgeBase =
  'inline-flex items-center gap-1.5 text-center px-2.5 h-6 rounded-(--radius-pill) text-[0.8125rem] font-normal leading-none';

export type StatusTone = 'active' | 'done' | 'pending' | 'failed' | 'draft';

export const getStatusTone = (status?: string): StatusTone => {
  switch (status) {
    case 'OPEN':
    case 'IN_PROGRESS':
      return 'active';
    case 'COMPLETED':
    case 'ACTIVE':
      return 'done';
    case 'REJECTED':
    case 'CLOSED':
    case 'CANCELLED':
      return 'failed';
    case 'REOPENED':
    case 'PENDING':
      return 'pending';
    default:
      return 'draft';
  }
};

const statusToneClassName: Record<StatusTone, string> = {
  /* Active is the inversion: the chip takes ink as its ground. */
  active: 'invert-surface',
  done: 'border border-(--ink) text-(--ink)',
  /* Waiting reads as provisional through a dashed edge, not a colour. */
  pending: 'border border-dashed border-(--line-strong) text-(--muted)',
  failed: 'border border-(--ink) text-(--ink) line-through',
  draft: 'bg-(--surface) text-(--muted)',
};

export const getStatusBackgroundColor = (status?: string) =>
  `${statusBadgeBase} ${statusToneClassName[getStatusTone(status)]}`;
