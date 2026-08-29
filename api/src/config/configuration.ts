export default () => ({
  port: parseInt(process.env.PORT || '8080', 10),
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
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
