import './polyfills';
import 'reflect-metadata';
import cluster from 'cluster';
import os from 'os';
import { NestFactory } from '@nestjs/core';
import { configureHttp } from './common/configure-http';
import { AppModule } from './app.module';
import logger from './helpers/logger.helper';

async function bootstrap() {
  // Apply database migrations before starting this HTTP process.
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  configureHttp(app);

  const port = process.env.PORT || 8080;
  await app.listen(port);
  logger.success(`Worker ${process.pid} started on port ${port}`);
}

const useCluster = process.env.NODE_ENV === 'production';

if (useCluster && cluster.isPrimary) {
  // Per-process limits are predictable by default. Gateways must enforce a
  // shared limit when scaling beyond one worker.
  const numCPUs = Math.max(1, Math.min(Number(process.env.WEB_CONCURRENCY || 1), os.cpus().length));
  logger.info(`Master ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    logger.info(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  bootstrap().catch((error) => {
    logger.error('Failed to start NestJS application', error);
    process.exit(1);
  });
}
