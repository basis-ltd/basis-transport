import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import {
  auditRequestContext,
  AuditRequestContext,
} from './request-context.store';

const REQUEST_ID_HEADER = 'x-request-id';

function getOrCreateRequestId(req: Request): string {
  const h = req.headers[REQUEST_ID_HEADER];
  const fromHeader = Array.isArray(h) ? h[0] : h;
  if (typeof fromHeader === 'string' && fromHeader.trim()) {
    return fromHeader.trim().slice(0, 128);
  }
  return randomUUID();
}

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId = getOrCreateRequestId(req);
    req.headers[REQUEST_ID_HEADER] = requestId;

    const store: AuditRequestContext = { requestId };
    auditRequestContext.run(store, () => {
      next();
    });
  }
}
