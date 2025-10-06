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

    if (req.method === 'POST') {
      if (path === AUTH_LOGIN_PATH && typeof req.body?.email === 'string') {
        return `${baseTracker}:login:${req.body.email.trim().toLowerCase()}`;
      }

      if (path === AUTH_REGISTER_PATH && typeof req.body?.email === 'string') {
        return `${baseTracker}:register:${req.body.email.trim().toLowerCase()}`;
      }

      if (path === AUTH_REFRESH_PATH && typeof req.body?.refreshToken === 'string') {
        return `${baseTracker}:refresh:${req.body.refreshToken}`;
      }
    }

    return baseTracker;
  }
}
