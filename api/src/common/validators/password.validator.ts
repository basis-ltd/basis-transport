import { Matches } from 'class-validator';

export const PASSWORD_PATTERN =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

export const PASSWORD_VALIDATION_MESSAGE =
  'Password must be at least 8 characters and include uppercase, lowercase, number, and special character';

export function IsStrongPassword() {
  return Matches(PASSWORD_PATTERN, {
    message: PASSWORD_VALIDATION_MESSAGE,
  });
}
