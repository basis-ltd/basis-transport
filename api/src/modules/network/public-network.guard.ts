import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class PublicNetworkGuard implements CanActivate {
  private buckets = new Map<string, { count: number; expires: number }>();
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const ip = req.socket.remoteAddress || 'unknown'; // Never trust user-supplied X-Forwarded-For.
    const now = Date.now();
    if (this.buckets.size > 10000)
      for (const [key, bucket] of this.buckets)
        if (bucket.expires <= now) this.buckets.delete(key);
    const path = req.path;
    const key = `${ip}:${path.includes('reports') ? 'reports' : path.includes('journeys') ? 'plan' : 'search'}`;
    const limit = path.includes('reports')
      ? 5
      : path.includes('journeys')
        ? 20
        : 120;
    let bucket = this.buckets.get(key);
    if (!bucket || bucket.expires <= now) {
      if (this.buckets.size >= 10000)
        throw new HttpException('Service is busy. Try again shortly.', 429);
      bucket = { count: 0, expires: now + 60000 };
      this.buckets.set(key, bucket);
    }
    if (++bucket.count > limit) {
      context
        .switchToHttp()
        .getResponse()
        .setHeader('Retry-After', Math.ceil((bucket.expires - now) / 1000));
      throw new HttpException('Too many requests. Try again shortly.', 429);
    }
    return true;
  }
}
