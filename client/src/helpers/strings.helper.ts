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
 * Get the background color for a status.
 * @param status - The status to get the background color for.
 * @returns The background color.
 */
export const getStatusBackgroundColor = (status?: string) => {
  let bgColor =
    'bg-gray-700 text-center p-[3px] px-4 text-white text-normal rounded-md text-[12px]';
  switch (status) {
    case 'OPEN':
      bgColor =
        'bg-primary text-center p-1 px-4 text-white text-normal rounded-lg text-[12px]';
      break;
    case 'COMPLETED':
      bgColor =
        'bg-green-700 text-center p-1 px-4 text-white text-normal rounded-lg text-[12px]';
      break;
    case 'REJECTED':
    case 'CLOSED':
      bgColor =
        'bg-red-700 text-center p-1 px-4 text-white text-normal rounded-lg text-[12px]';
      break;
    case 'IN_PROGRESS':
      bgColor =
        'bg-orange-700 text-center p-1 px-4 text-white text-normal rounded-lg text-[12px]';
      break;
    case 'REOPENED':
    case 'PENDING':
      bgColor =
        'bg-yellow-700 text-center p-1 px-4 text-white text-normal rounded-lg text-[12px]';
      break;
    default:
      bgColor =
        'bg-gray-700 text-center p-1 px-4 text-white text-normal rounded-lg text-[12px]';
  }
  return bgColor;
};
