import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

type Wrapped<T> = { success: true; data?: T; meta?: unknown } | { success: true };

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, Wrapped<T>>
{
  intercept(context: ExecutionContext, next: CallHandler): Observable<Wrapped<T>> {
    return next.handle().pipe(
      map((data: unknown) => {
        // 1) 既にラップ済みはそのまま返す
        if (data && typeof data === 'object' && 'success' in (data as Record<string, unknown>)) {
          return data as Wrapped<T>;
        }

        // 2) null/undefined は payload なしの成功
        if (data === null || data === undefined) {
          return { success: true };
        }

        // 3) { data, meta } っぽい構造はメタを維持
        if (data && typeof data === 'object') {
          const obj = data as Record<string, unknown>;
          if ('data' in obj && !('success' in obj)) {
            const payload: { success: true; data: unknown; meta?: unknown } = {
              success: true,
              data: obj.data,
            };
            if ('meta' in obj) {
              payload.meta = obj.meta;
            }
            return payload as Wrapped<T>;
          }
        }

  // 4) 配列・プリミティブ・オブジェクトは data に包む
  return { success: true, data } as Wrapped<T>;
      }),
    );
  }
}
