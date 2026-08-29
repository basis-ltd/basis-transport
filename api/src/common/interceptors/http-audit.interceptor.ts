import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { redactForAudit } from '../../helpers/auditSerialize.helper';
import { HttpAuditService } from '../../modules/logs/http-audit.service';
import logger from '../../helpers/logger.helper';
import { AuthenticatedUser } from '../types/auth.types';

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function clientIp(req: Request): string | undefined {
  const xf = req.headers['x-forwarded-for'];
  const fromForwarded =
    typeof xf === 'string'
      ? xf.split(',')[0]?.trim()
      : Array.isArray(xf)
        ? xf[0]
        : undefined;
  return fromForwarded || req.socket?.remoteAddress || undefined;
}

@Injectable()
export class HttpAuditInterceptor implements NestInterceptor {
  constructor(private readonly httpAuditService: HttpAuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    if (!MUTATING.has(req.method)) {
      return next.handle();
    }

    const startedAt = Date.now();
    const bodySnapshot =
      req.body &&
      typeof req.body === 'object' &&
      Object.keys(req.body).length > 0
        ? (redactForAudit(req.body) as Record<string, unknown>)
        : null;

    return next.handle().pipe(
      tap({
        finalize: () => {
          const durationMs = Date.now() - startedAt;
          const path = (req.originalUrl || req.url || '').split('?')[0];
          const correlationId =
            (req.headers['x-request-id'] as string) || undefined;
          const actorUserId = (req as Request & { user?: AuthenticatedUser })
            .user?.id;

          setImmediate(() => {
            this.httpAuditService
              .saveHttpAudit({
                correlationId,
                httpMethod: req.method,
                httpPath: path.slice(0, 2048),
                httpStatus: res.statusCode,
                durationMs,
                ip: clientIp(req)?.slice(0, 64),
                userAgent: (req.headers['user-agent'] as string)?.slice(
                  0,
                  2000
                ),
                actorUserId,
                bodySnapshot,
              })
              .catch((err) => {
                logger.error('httpAudit: failed to persist audit row', err);
              });
          });
        },
      })
    );
  }
}
