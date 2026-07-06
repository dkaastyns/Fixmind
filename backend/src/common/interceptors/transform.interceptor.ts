import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { successResponse } from '../types/api-response';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data) => {
        if (
          data &&
          typeof data === 'object' &&
          'success' in data &&
          (data as { success: boolean }).success === true
        ) {
          return data;
        }

        if (
          data &&
          typeof data === 'object' &&
          'data' in data &&
          'message' in data
        ) {
          const payload = data as {
            data: unknown;
            message?: string;
            meta?: { page: number; limit: number; total: number };
          };
          return successResponse(
            payload.data,
            payload.message ?? 'OK',
            payload.meta,
          );
        }

        return successResponse(data);
      }),
    );
  }
}
