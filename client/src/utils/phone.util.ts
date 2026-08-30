import {
  isPossiblePhoneNumber,
  isValidPhoneNumber as isValidPhoneNumberValue,
  parsePhoneNumber,
  type Country,
} from 'react-phone-number-input/max';
import type { PhoneNumberType } from 'libphonenumber-js/max';

export const SUPPORTED_PHONE_COUNTRY = 'RW' as const satisfies Country;
export const RWANDA_DIAL_CODE = '+250';

export interface PhoneValidationResult {
  isValid: boolean;
  e164?: string;
  national?: string;
  international?: string;
  country?: Country;
  type?: PhoneNumberType;
  error?: string;
}

const requiredError = 'Phone number is required.';
const invalidError = 'Enter a valid Rwandan phone number.';
const incompleteError = 'Enter a complete Rwandan phone number.';
const foreignCountryError = `Only Rwanda (${RWANDA_DIAL_CODE}) numbers are supported.`;

export function validateAndFormatPhoneNumber(
  input: string | null | undefined,
): PhoneValidationResult {
  const value = input?.trim();

  if (!value) {
    return { isValid: false, error: requiredError };
  }

  try {
    const phoneNumber = parsePhoneNumber(value, SUPPORTED_PHONE_COUNTRY);

    if (!phoneNumber) {
      return { isValid: false, error: incompleteError };
    }

    if (phoneNumber.country !== SUPPORTED_PHONE_COUNTRY) {
      return {
        isValid: false,
        country: phoneNumber.country,
        error: foreignCountryError,
      };
    }

    if (!isPossiblePhoneNumber(phoneNumber.number)) {
      return {
        isValid: false,
        country: phoneNumber.country,
        error: incompleteError,
      };
    }

    if (!isValidPhoneNumberValue(phoneNumber.number)) {
      return {
        isValid: false,
        country: phoneNumber.country,
        error: invalidError,
      };
    }

    return {
      isValid: true,
      e164: phoneNumber.number,
      national: phoneNumber.formatNational(),
      international: phoneNumber.formatInternational(),
      country: phoneNumber.country,
      type: phoneNumber.getType(),
    };
  } catch {
    return {
      isValid: false,
      error:
        value.startsWith('+') && !value.startsWith(RWANDA_DIAL_CODE)
          ? foreignCountryError
          : incompleteError,
    };
  }
}

export function normalizePhoneNumber(
  input: string | null | undefined,
): string | null {
  return validateAndFormatPhoneNumber(input).e164 ?? null;
}

export function isValidPhoneNumber(
  input: string | null | undefined,
): boolean {
  return validateAndFormatPhoneNumber(input).isValid;
}

export function validatePhoneNumber(
  input: string | null | undefined,
  required = true,
): true | string {
  if (!input?.trim() && !required) return true;

  const result = validateAndFormatPhoneNumber(input);
  return result.isValid ? true : (result.error ?? invalidError);
}

export function formatPhoneForDisplay(
  input: string | null | undefined,
): string {
  if (!input) return '';
  return validateAndFormatPhoneNumber(input).international ?? input;
}
