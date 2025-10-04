import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

type Wrapped<T, M = undefined> = { success: true; data?: T; meta?: M } | { success: true };

@Injectable()
export class TransformResponseInterceptor<T, M = undefined>
  implements NestInterceptor<T, Wrapped<T, M>>
{
  intercept(context: ExecutionContext, next: CallHandler): Observable<Wrapped<T, M>> {
    return next.handle().pipe(
      map((data: T) => {
        // 1) 既にラップ済みはそのまま返す
        if (data && typeof data === 'object' && 'success' in (data as unknown as { success: true })) {
          return data as unknown as Wrapped<T, M>;
        }

        // 2) null/undefined は payload なしの成功
        if (data === null || data === undefined) {
          return { success: true };
        }

        // 3) { data, meta } っぽい構造はメタを維持
        if (data && typeof data === 'object') {
          const obj = data as { data?: T; meta?: M };
          if ('data' in obj && !('success' in obj)) {
            const payload: { success: true; data: T; meta?: M } = {
              success: true,
              data: obj.data as T,
            };
            if ('meta' in obj) {
              payload.meta = obj.meta;
            }
            return payload as Wrapped<T, M>;
          }
        }

  // 4) 配列・プリミティブ・オブジェクトは data に包む
  return { success: true, data } as Wrapped<T, M>;
      }),
    );
  }
}
