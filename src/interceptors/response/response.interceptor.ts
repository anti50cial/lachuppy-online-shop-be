import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();

    return next.handle().pipe(
      map((response) => ({
        success: true,
        message: response.message,
        data: response.data,
        statusCode: ctx.getResponse().statusCode,
        timestamp: new Date().toISOString(),
        path: request.url,
      })),
    );
  }
}
