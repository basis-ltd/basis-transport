// GENERATE REFERENCE ID
export const generateReferenceId = (
  length: number = 5,
  prefix: string = 'REF'
): string => {
  const randomNumber = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(length, '0');
  return `${prefix}-${randomNumber}`;
};
