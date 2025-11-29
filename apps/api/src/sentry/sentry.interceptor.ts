import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as Sentry from '@sentry/node';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        // Only report server errors (5xx), not client errors (4xx)
        if (error instanceof HttpException) {
          const status = error.getStatus();
          if (status >= 500) {
            this.captureException(error, context);
          }
        } else {
          // Non-HTTP errors (e.g., database errors, unexpected errors)
          this.captureException(error, context);
        }

        return throwError(() => error);
      }),
    );
  }

  private captureException(error: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    Sentry.withScope((scope) => {
      // Add request context
      scope.setContext('request', {
        method: request.method,
        url: request.url,
        headers: this.sanitizeHeaders(request.headers),
        query: request.query,
        body: this.sanitizeBody(request.body),
      });

      // Add user context (if authenticated)
      if (user) {
        scope.setUser({
          id: user.id,
          email: user.email,
          username: user.name,
        });
      }

      // Add tags for filtering
      scope.setTag('endpoint', `${request.method} ${request.route?.path || request.url}`);
      scope.setTag('status_code', error.status || 500);

      // Capture the exception
      Sentry.captureException(error);
    });
  }

  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    delete sanitized.authorization;
    delete sanitized.cookie;
    delete sanitized['x-api-key'];
    return sanitized;
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;
    
    const sanitized = { ...body };
    delete sanitized.password;
    delete sanitized.apiKey;
    delete sanitized.token;
    delete sanitized.secret;
    
    return sanitized;
  }
}
