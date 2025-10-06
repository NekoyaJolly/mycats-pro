import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * パフォーマンス監視インターセプター
 * レスポンスタイムを計測し、遅いリクエストを警告する
 */
@Injectable()
export class PerformanceMonitoringInterceptor implements NestInterceptor {
  private readonly logger = new Logger('PerformanceMonitor');
  private readonly SLOW_REQUEST_THRESHOLD_MS = 1000; // 1秒以上を遅いと判定
  private readonly VERY_SLOW_REQUEST_THRESHOLD_MS = 3000; // 3秒以上を非常に遅いと判定

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - startTime;
          const response = context.switchToHttp().getResponse();
          const { statusCode } = response;

          // 基本的なリクエストログ
          const logData = {
            method,
            url,
            statusCode,
            responseTime: `${responseTime}ms`,
            ip,
            userAgent: userAgent.substring(0, 100), // 長すぎる場合は切り詰め
            timestamp: new Date().toISOString(),
          };

          // パフォーマンス警告
          if (responseTime >= this.VERY_SLOW_REQUEST_THRESHOLD_MS) {
            this.logger.error({
              message: 'Very slow request detected',
              ...logData,
              severity: 'critical',
            });
          } else if (responseTime >= this.SLOW_REQUEST_THRESHOLD_MS) {
            this.logger.warn({
              message: 'Slow request detected',
              ...logData,
              severity: 'warning',
            });
          } else if (process.env.NODE_ENV === 'development') {
            // 開発環境では全リクエストをログ
            this.logger.debug(logData);
          }
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;
          
          // エラーログ
          this.logger.error({
            message: 'Request failed with error',
            method,
            url,
            responseTime: `${responseTime}ms`,
            ip,
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
          });
        },
      }),
    );
  }
}
