import { ValidationError } from './errors.helper';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailProps {
  toEmail: string;
  fromEmail?: string;
  subject: string;
  htmlContent: string;
  attachments?: {
    content: string;
    filename: string;
    type?: string;
    disposition?: string;
  }[];
}

export const sendEmail = async ({
  toEmail,
  fromEmail = String(process.env.RESEND_FROM),
  subject,
  htmlContent,
}: SendEmailProps) => {
  if (!process.env.RESEND_API_KEY) {
    throw new ValidationError('Email is not configured');
  }
  if (!fromEmail) {
    throw new ValidationError('RESEND_FROM is not configured');
  }

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject,
      html: htmlContent,
    });

    if (error) {
      throw new Error(error.message);
    }
    return true;
  } catch {
    throw new ValidationError('Failed to send email');
  }
};
