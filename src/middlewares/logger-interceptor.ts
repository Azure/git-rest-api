import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private logger = new Logger("Request");

  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const req = context.switchToHttp().getRequest();
    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const duration = Date.now() - now;
        this.logger.log(`${req.method} ${response.statusCode} ${req.originalUrl} (${duration}ms)`);
      }),
      catchError(error => {
        const response = error.response;
        const duration = Date.now() - now;
        this.logger.log(`${req.method} ${response.statusCode} ${req.originalUrl} (${duration}ms)`);
        return throwError(error);
      }),
    );
  }
}
