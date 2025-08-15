import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response, Request } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
  const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
  let details: unknown = undefined;

    // NestJSのHTTP例外
    if (exception instanceof HttpException) {
      status = exception.getStatus();
  const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse) {
        const resp = exceptionResponse as Record<string, unknown> & { message?: string | string[]; error?: string };
        const msg = resp.message;
        message = Array.isArray(msg) ? msg.join(', ') : (typeof msg === 'string' ? msg : (resp.error ?? message));
        code = (typeof resp.error === 'string' ? resp.error : undefined) || this.getErrorCodeFromStatus(status);
        details = (resp as { details?: unknown }).details;
      }
    }
    // Prismaエラーハンドリング
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const prismaError = this.handlePrismaError(exception);
      status = prismaError.status;
      message = prismaError.message;
      code = prismaError.code;
    }
    // Prisma Unknown Request Error
    else if (exception instanceof Prisma.PrismaClientUnknownRequestError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Unknown database error';
      code = 'DATABASE_UNKNOWN_ERROR';
      details = { message: exception.message };
    }
    // Prisma Rust Panic Error
    else if (exception instanceof Prisma.PrismaClientRustPanicError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Database engine panic';
      code = 'DATABASE_PANIC';
      details = { message: exception.message };
    }
    // Prisma Validation Error
    else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid data provided';
      code = 'VALIDATION_ERROR';
      // 可能であれば message からフィールド単位の情報を推測して抽出
      const parsed = this.parsePrismaValidationMessage(exception.message);
      details = parsed ?? { message: exception.message };
    }
    // その他のエラー
    else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(exception.stack);
    }

    // ログ出力
    this.logger.error(
  `${request.method} ${request.url} - ${status} ${message}`,
  exception instanceof Error ? exception.stack : String(exception),
    );

    // 統一レスポンス形式でエラーを返す
    const errorResponse = {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }

  private handlePrismaError(error: Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': {
        // 一意制約違反
        const field = error.meta?.target as string[] | undefined;
        return {
          status: HttpStatus.CONFLICT,
          message: field
            ? `${field.join(', ')} already exists`
            : 'Duplicate entry',
          code: 'DUPLICATE_ENTRY',
        };
      }
      
      case 'P2025':
        // レコードが見つからない
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Record not found',
          code: 'NOT_FOUND',
        };
      
      case 'P2003':
        // 外部キー制約違反
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Foreign key constraint failed',
          code: 'FOREIGN_KEY_ERROR',
        };
      
      case 'P2014':
        // 必須関連レコードが見つからない
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Required relation missing',
          code: 'RELATION_ERROR',
        };
      
      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Database error',
          code: 'DATABASE_ERROR',
        };
    }
  }

  private getErrorCodeFromStatus(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'VALIDATION_ERROR';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'RATE_LIMITED';
      default:
        return 'INTERNAL_ERROR';
    }
  }

  /**
   * Prisma ValidationError のメッセージ（英語）からフィールド名やエラー内容を推測して抽出します。
   * 例: "Argument name for data.name is missing." / "Unknown arg `foo` in data.foo for type CatCreateInput."
   * フォーマットは Prisma のバージョンにより変わるため、失敗しても安全に undefined を返します。
   */
  private parsePrismaValidationMessage(msg: string):
    | {
        issues: Array<{
          field?: string;
          message: string;
          hint?: string;
        }>;
        raw: string;
      }
    | undefined {
    try {
      const issues: Array<{ field?: string; message: string; hint?: string }> = [];

      const lines = msg.split('\n').map((l) => l.trim());
      for (const line of lines) {
        if (!line) continue;

        // Unknown arg `foo` in data.foo for type CatCreateInput.
        let m = line.match(/Unknown arg `([^`]+)` in (data\.[^\s]+) for type /i);
        if (m) {
          issues.push({ field: m[2], message: `Unknown argument: ${m[1]}` });
          continue;
        }

        // Argument name for data.name is missing.
        m = line.match(/Argument [^\s]+ for (data\.[^\s]+) is missing\.?/i);
        if (m) {
          issues.push({ field: m[1], message: 'Required field is missing' });
          continue;
        }

        // Type mismatch: "Argument name: Provided String, expected Int" パターンを緩く検出
        m = line.match(/Argument ([^:]+): Provided ([^,]+), expected ([^.]+)\.?/i);
        if (m) {
          issues.push({ field: m[1], message: `Type mismatch: ${m[2]} -> ${m[3]}` });
          continue;
        }

        // data.foo.tooLong:〜のようなカスタムメッセージも拾っておく
        m = line.match(/(data\.[^\s:]+):\s*(.+)$/i);
        if (m) {
          issues.push({ field: m[1], message: m[2] });
          continue;
        }

        // それ以外は生の行を格納
        issues.push({ message: line });
      }

      if (issues.length === 0) return undefined;
      return { issues, raw: msg };
    } catch {
      return undefined;
    }
  }
}
