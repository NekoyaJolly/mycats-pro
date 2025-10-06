import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { Request, Response } from 'express';

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

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : undefined;

    const responseMessage =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? (exceptionResponse as Record<string, unknown>).message
        : undefined;

    const message = Array.isArray(responseMessage)
      ? responseMessage.join(', ')
      : typeof responseMessage === 'string'
        ? responseMessage
        : exception instanceof HttpException
            ? exception.message
            : 'Internal server error';

    const errorResponse: Record<string, unknown> = {
      statusCode: status,
      code: HttpStatus[status] ?? 'ERROR',
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    if (Array.isArray(responseMessage)) {
      errorResponse.details = responseMessage;
    }

    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'details' in exceptionResponse &&
      !('details' in errorResponse)
    ) {
      errorResponse.details = (exceptionResponse as Record<string, unknown>).details;
    }

    // 構造化エラーログ
    const logData = {
      ...errorResponse,
      ip: request.ip,
      userAgent: request.get('user-agent'),
      userId: request.user?.userId,
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
              id: request.user?.userId,
              email: request.user?.email,
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
