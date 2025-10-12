import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';

const AUTH_LOGIN_PATH = '/api/v1/auth/login';
const AUTH_REGISTER_PATH = '/api/v1/auth/register';
const AUTH_REFRESH_PATH = '/api/v1/auth/refresh';

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Request): Promise<string> {
    const baseTracker = await super.getTracker(req);
    const path = req.path || req.originalUrl || '';
    const body = typeof req.body === 'object' && req.body !== null ? req.body as Record<string, unknown> : undefined;

    if (req.method === 'POST') {
      if (path === AUTH_LOGIN_PATH) {
        const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : undefined;
        if (email) {
          return `${baseTracker}:login:${email}`;
        }
      }

      if (path === AUTH_REGISTER_PATH) {
        const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : undefined;
        if (email) {
          return `${baseTracker}:register:${email}`;
        }
      }

      if (path === AUTH_REFRESH_PATH) {
        const refreshToken = typeof body?.refreshToken === 'string' ? body.refreshToken : undefined;
        if (refreshToken) {
          return `${baseTracker}:refresh:${refreshToken}`;
        }
      }
    }

    return baseTracker;
  }
}
