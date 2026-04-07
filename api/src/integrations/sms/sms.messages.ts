export function buildPhoneOtpMessage(otp: string) {
  return `Your Basis Transport verification code is ${otp}. It expires in 10 minutes.`;
}