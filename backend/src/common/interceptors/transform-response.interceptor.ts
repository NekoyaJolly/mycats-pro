import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, any>
{
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // 1) 既にラップ済みはそのまま返す
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // 2) null/undefined は payload なしの成功
        if (data === null || data === undefined) {
          return { success: true };
        }

        // 3) { data, meta } っぽい構造はメタを維持
        if (
          data &&
          typeof data === 'object' &&
          'data' in data &&
          !('success' in data)
        ) {
          const payload: any = { success: true, data: (data as any).data };
          if ('meta' in (data as any)) {
            payload.meta = (data as any).meta;
          }
          return payload;
        }

        // 4) 配列・プリミティブ・オブジェクトは data に包む
        return { success: true, data };
      }),
    );
  }
}
