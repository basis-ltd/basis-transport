import './polyfills';
import 'reflect-metadata';
import cluster from 'cluster';
import os from 'os';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import logger from './helpers/logger.helper';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: false }));
  app.enableCors();
  app.setGlobalPrefix('api', {
    exclude: ['/'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      exceptionFactory: (errors) => {
        const messages = errors.flatMap((error) =>
          Object.values(error.constraints || {})
        );
        return new BadRequestException({
          message: messages[0] || 'Validation failed',
        });
      },
    })
  );

  const port = process.env.PORT || 8080;
  await app.listen(port);
  logger.success(`Worker ${process.pid} started on port ${port}`);
}

const useCluster = process.env.NODE_ENV === 'production';

if (useCluster && cluster.isPrimary) {
  const numCPUs = os.cpus().length;
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
