export interface AppConfig {
  port: number;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
  };
  jwt: {
    secret: string;
  };
  email: {
    resendApiKey?: string;
    resendFrom?: string;
  };
  clientAppUrl: string;
  pindo: {
    apiUrl: string;
    token?: string;
    senderId: string;
  };
}
