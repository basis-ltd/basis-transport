import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { json, urlencoded } from 'express';

/** Shared by the server and integration tests. Never log URLs with search queries. */
export function configureHttp(app: INestApplication) {
  app.use(json({ limit: '8mb' })); // bounded administrative snapshots
  app.use(urlencoded({ extended: false, limit: '32kb' }));
  app.use(
    (
      req: import('express').Request,
      res: import('express').Response,
      next: import('express').NextFunction
    ) => {
      res.setHeader('Referrer-Policy', 'strict-origin');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      if (
        /^\/api\/(trips|user-trips|locations|transport-cards|dashboard)(\/|$)/.test(
          req.path
        )
      ) {
        res
          .status(410)
          .json({
            message:
              'The legacy trip-management service has been retired. Use the public journey planner.',
          });
        return;
      }
      if (/^\/api\/(journeys|me|admin|reports)(\/|$)/.test(req.path))
        res.setHeader('Cache-Control', 'no-store');
      next();
    }
  );
  app.enableCors({
    origin: (process.env.CLIENT_APP_URL || 'http://localhost:5173').split(','),
  });
  app.setGlobalPrefix('api', { exclude: ['/'] });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) => {
        const flatten = (items: typeof errors): string[] =>
          items.flatMap((error) => [
            ...Object.values(error.constraints || {}),
            ...flatten(error.children || []),
          ]);
        return new BadRequestException({
          message: flatten(errors)[0] || 'Validation failed',
        });
      },
    })
  );
}
