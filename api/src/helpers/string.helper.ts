/**
 * Generate a random reference ID.
 * @param length - The length of the reference ID.
 * @param prefix - The prefix of the reference ID.
 * @returns A random reference ID.
 */
export const generateReferenceId = (
  length: number = 5,
  prefix: string = 'REF'
): string => {
  const randomNumber = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(length, '0');
  return `${prefix}-${randomNumber}`;
};

/**
 * Generate a random string of a given length.
 * @param length - The length of the string to generate.
 * @returns A random string of the given length.
 */
export const generateRandomString = (length: number = 8) => {
  return Math.random()
    .toString(36)
    .substring(2, length + 2);
};