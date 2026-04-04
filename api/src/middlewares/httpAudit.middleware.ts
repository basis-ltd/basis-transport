import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';
import { redactForAudit } from '../helpers/auditSerialize.helper';
import { httpAuditServiceSingleton } from '../services/httpAudit.service';
import logger from '../helpers/logger.helper';

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

/**
 * Persists one row per mutating request after the response finishes.
 * Uses req.user (set by route auth) and x-request-id header for correlation.
 * Failures are logged and never block the response.
 */
export function httpAuditMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!MUTATING.has(req.method)) {
    return next();
  }

  const startedAt = Date.now();
  const bodySnapshot =
    req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0
      ? (redactForAudit(req.body) as Record<string, unknown>)
      : null;

  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;
    const path = (req.originalUrl || req.url || '').split('?')[0];
    const correlationId = (req.headers['x-request-id'] as string) || undefined;
    const authReq = req as AuthenticatedRequest;
    const actorUserId = authReq.user?.id;

    setImmediate(() => {
      httpAuditServiceSingleton
        .saveHttpAudit({
          correlationId,
          httpMethod: req.method,
          httpPath: path.slice(0, 2048),
          httpStatus: res.statusCode,
          durationMs,
          ip: clientIp(req)?.slice(0, 64),
          userAgent: (req.headers['user-agent'] as string)?.slice(0, 2000),
          actorUserId,
          bodySnapshot,
        })
        .catch((err) => {
          logger.error('httpAudit: failed to persist audit row', err);
        });
    });
  });

  next();
}
