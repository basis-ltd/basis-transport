import axios, { AxiosInstance } from 'axios';
import logger from '../../helpers/logger.helper';

interface SendSMSPayload {
  to: string;
  text: string;
  sender?: string;
}

export class SMSService {
  private readonly client: AxiosInstance;
  private readonly senderId: string;

  constructor(client?: AxiosInstance) {
    this.client =
      client ||
      axios.create({
        baseURL: process.env.PINDO_API_URL || 'https://api.pindo.io/v1/sms/',
        headers: {
          Authorization: `Bearer ${process.env.PINDO_TOKEN || ''}`,
          'Content-Type': 'application/json',
        },
      });
    this.senderId = process.env.PINDO_SENDER_ID || 'Peekaboo';
  }

  async send({
    to,
    text,
    sender,
  }: SendSMSPayload): Promise<unknown> {
    try {
      const response = await this.client.post('', {
        to,
        text,
        sender: sender || this.senderId,
      });

      logger.info(`SMS sent to ${to}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to send SMS to ${to}`);
      return null;
    }
  }
}
