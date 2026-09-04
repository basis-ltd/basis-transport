import { ValidationError } from '../../helpers/errors.helper';
import { LogReferenceTypes } from '../../constants/logs.constants';

export function formatLocalPhoneNumber(phoneNumber: string): string {
  const cleanedNumber = phoneNumber.replace(/\D/g, '');

  if (cleanedNumber.length === 12) {
    if (cleanedNumber.startsWith('250')) {
      const prefix = cleanedNumber.slice(3, 5);
      if (['78', '79', '72', '73'].includes(prefix)) {
        return `+${cleanedNumber}`;
      }
    }
  } else if (cleanedNumber.length === 10) {
    const prefix = cleanedNumber.slice(0, 3);
    if (['078', '079', '072', '073'].includes(prefix)) {
      return `+250${cleanedNumber.slice(1)}`;
    }
  } else if (cleanedNumber.length === 9) {
    const prefix = cleanedNumber.slice(0, 2);
    if (['78', '79', '72', '73'].includes(prefix)) {
      return `+250${cleanedNumber}`;
    }
  }

  throw new ValidationError('Invalid phone number format', {
    referenceType: LogReferenceTypes.USER,
  });
}

export function formatInternationalPhoneNumber(phoneNumber: string): string {
  return phoneNumber.replace(/\D/g, '');
}
