import '../polyfills';
import 'reflect-metadata';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { DataSource } from 'typeorm';
import { entities } from './database.module';
import { Baseline1788000000000 } from './migrations/1788000000000-baseline';
import { JourneyNetwork1788000001000 } from './migrations/1788000001000-journey-network';
import { ArchiveLegacy1788000002000 } from './migrations/1788000002000-archive-legacy';

const envFile = resolve(__dirname, '../../.env');
if (existsSync(envFile)) process.loadEnvFile(envFile);
const local = [
  'localhost',
  '127.0.0.1',
  'host.docker.internal',
  '/var/run/postgresql',
].includes(process.env.DB_HOST || '');
export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: local ? false : { rejectUnauthorized: true },
  synchronize: false,
  entities,
  migrations: [
    Baseline1788000000000,
    JourneyNetwork1788000001000,
    ArchiveLegacy1788000002000,
  ],
  migrationsTransactionMode: 'all',
});
