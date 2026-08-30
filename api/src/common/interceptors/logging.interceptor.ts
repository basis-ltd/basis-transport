import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const { method, originalUrl } = req;
    const startedAt = Date.now();

    return next.handle().pipe(
      tap({
        finalize: () => {
          const ms = Date.now() - startedAt;
          this.logger.log(`${method} ${originalUrl} - ${ms}ms`);
        },
      })
    );
  }
}
