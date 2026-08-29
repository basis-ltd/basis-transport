import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api', { exclude: ['/'] });
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
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET / returns welcome message', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((res: request.Response) => {
        expect(res.body.message).toContain('Transport Management API');
      });
  });

  it('GET /api/dashboard/public/landing-stats is public', () => {
    return request(app.getHttpServer())
      .get('/api/dashboard/public/landing-stats')
      .expect(200)
      .expect((res: request.Response) => {
        expect(res.body.message).toBe(
          'Public landing stats retrieved successfully'
        );
        expect(res.body.data).toHaveProperty('commutes');
        expect(res.body.data).toHaveProperty('users');
      });
  });
});
