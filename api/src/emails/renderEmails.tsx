import { render } from '@react-email/render';
import PasswordResetEmail from './PasswordResetEmail';
import UserWelcomeEmail from './UserWelcomeEmail';

export async function renderPasswordResetHtml(props: {
  userName?: string;
  resetUrl: string;
}): Promise<string> {
  return render(<PasswordResetEmail {...props} />);
}

export async function renderUserWelcomeHtml(props: {
  userName?: string;
  password: string;
  loginUrl: string;
  year: number;
}): Promise<string> {
  return render(<UserWelcomeEmail {...props} />);
}
