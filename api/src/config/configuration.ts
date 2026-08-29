import { AppConfig } from './config.types';

export default (): AppConfig => ({
  port: parseInt(process.env.PORT || '8080', 10),
  database: {
    host: process.env.DB_HOST as string,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
    name: process.env.DB_NAME as string,
  },
  jwt: {
    secret: process.env.JWT_SECRET as string,
  },
  email: {
    resendApiKey: process.env.RESEND_API_KEY,
    resendFrom: process.env.RESEND_FROM,
  },
  clientAppUrl: process.env.CLIENT_APP_URL || 'http://localhost:5173',
  pindo: {
    apiUrl: process.env.PINDO_API_URL || 'https://api.pindo.io/v1/sms/',
    token: process.env.PINDO_TOKEN,
    senderId: process.env.PINDO_SENDER_ID || 'Transport',
  },
});
