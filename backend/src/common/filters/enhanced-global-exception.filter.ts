import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as Sentry from '@sentry/node';

/**
 * エラー監視を強化したグローバル例外フィルター
 * Sentryと構造化ログに対応
 */
@Catch()
export class EnhancedGlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('GlobalExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    const errorResponse = {
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    // 構造化エラーログ
    const logData = {
      ...errorResponse,
      ip: request.ip,
      userAgent: request.get('user-agent'),
      userId: (request as any).user?.userId,
      error: exception instanceof Error ? exception.stack : String(exception),
    };

    // エラーレベルに応じたログ出力
    if (status >= 500) {
      this.logger.error({
        message: 'Server error occurred',
        ...logData,
        severity: 'error',
      });

      // Sentryに報告（本番環境のみ）
      if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
        Sentry.captureException(exception, {
          contexts: {
            request: {
              method: request.method,
              url: request.url,
              headers: request.headers,
            },
            user: {
              id: (request as any).user?.userId,
              email: (request as any).user?.email,
            },
          },
        });
      }
    } else if (status >= 400) {
      this.logger.warn({
        message: 'Client error occurred',
        ...logData,
        severity: 'warning',
      });
    }

    // レスポンス送信
    response.status(status).json({
      success: false,
      error: errorResponse,
    });
  }
}
