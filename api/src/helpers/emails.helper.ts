import { ValidationError } from './errors.helper';
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

// CONFIGURE DOTENV
dotenv.config();

// SET SENDGRID API KEY
sgMail.setApiKey(String(process.env.SENDGRID_API_KEY));

/**
 * Send an email using SendGrid.
 *
 * @param {string} toEmail - Recipient's email address.
 * @param {string} fromEmail - Sender's email address.
 * @param {string} subject - Subject line of the email.
 * @param {string} htmlContent - HTML content of the email.
 * @param {string} textContent - Plain text content of the email (optional).
 */

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
  fromEmail = String(process.env.SENDGRID_SEND_FROM),
  subject,
  htmlContent,
  attachments,
}: SendEmailProps) => {
  const msg = {
    to: toEmail,
    from: fromEmail,
    subject,
    html: htmlContent,
    attachments,
  };

  try {
    await sgMail.send(msg);
    return true;
  } catch (error) {
    throw new ValidationError('Failed to send email');
  }
};
