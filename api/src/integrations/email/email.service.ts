import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { AppConfig } from '../../config/config.types';
import { ValidationError } from '../../helpers/errors.helper';

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

@Injectable()
export class EmailService {
  private readonly resend: Resend;

  constructor(private readonly config: ConfigService<AppConfig, true>) {
    this.resend = new Resend(
      this.config.get('email.resendApiKey', { infer: true })
    );
  }

  async send({ to, subject, html, from }: SendEmailInput): Promise<void> {
    const apiKey = this.config.get('email.resendApiKey', { infer: true });
    const fromEmail =
      from || this.config.get('email.resendFrom', { infer: true });

    if (!apiKey) {
      throw new ValidationError('Email is not configured');
    }
    if (!fromEmail) {
      throw new ValidationError('RESEND_FROM is not configured');
    }

    const { error } = await this.resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    });

    if (error) {
      throw new ValidationError('Failed to send email');
    }
  }
}
