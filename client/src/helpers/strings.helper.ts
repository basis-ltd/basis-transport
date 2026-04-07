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

/** Shared layout for status chips (DESIGN: rounded-md, text-[11px], font-light). */
const statusBadgeBase =
  'text-center px-3 py-1 rounded-sm text-[11px] font-light leading-tight text-white';

/**
 * Muted status styles: light tints + dark text so states stay distinct without saturated fills.
 */
export const getStatusBackgroundColor = (status?: string) => {
  switch (status) {
    case 'OPEN':
      return `${statusBadgeBase} bg-primary text-primary`;
    case 'COMPLETED':
    case 'ACTIVE':
      return `${statusBadgeBase} bg-green-800 text-green-950`;
    case 'REJECTED':
    case 'CLOSED':
    case 'CANCELLED':
      return `${statusBadgeBase} bg-red-800 text-red-950`;
    case 'IN_PROGRESS':
      return `${statusBadgeBase} bg-sky-800 text-sky-950`;
    case 'REOPENED':
    case 'PENDING':
      return `${statusBadgeBase} bg-amber-800 text-amber-950`;
    default:
      return `${statusBadgeBase} bg-muted text-muted-foreground`;
  }
};
