export function buildPhoneOtpMessage(otp: string) {
  return `Your Basis Transport verification code is ${otp}. It expires in 10 minutes.`;
}

export function buildPhonePasswordResetOtpMessage(otp: string) {
  return `Your Basis Transport password reset code is ${otp}. It expires in 10 minutes.`;
}