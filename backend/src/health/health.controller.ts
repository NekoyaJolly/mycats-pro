import { Controller, Get } from '@nestjs/common';

import { RateLimiterService } from '../common/services/rate-limiter.service';

@Controller('health')
export class HealthController {
  constructor(private readonly rateLimiter: RateLimiterService) {}

  @Get()
  check() {
    this.rateLimiter.clearExpired();
    if (process.env.NODE_ENV === 'test') {
      this.rateLimiter.resetByPrefix('register:');
    }

    return {
      success: true,
      data: {
        status: 'ok',
        service: 'Cat Management System API',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV ?? 'development',
      },
    };
  }
}
