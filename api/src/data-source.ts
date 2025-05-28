import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: DB_HOST,
  port: DB_PORT as number | undefined,
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  synchronize: true,
  logging: false,
  entities: [`${__dirname}/**/**/*.entity.{ts,js}`],
  migrations: [`${__dirname}/**/migrations/*.{ts,js}`],
  ssl: ['localhost', 'host.docker.internal'].includes(
    String(DB_HOST)
  )
    ? false
    : {
        rejectUnauthorized: false,
      },
});
