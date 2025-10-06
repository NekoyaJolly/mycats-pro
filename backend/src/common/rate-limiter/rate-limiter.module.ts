import { Global, Module } from '@nestjs/common';

import { RateLimiterService } from '../services/rate-limiter.service';

@Global()
@Module({
  providers: [RateLimiterService],
  exports: [RateLimiterService],
})
export class RateLimiterModule {}
