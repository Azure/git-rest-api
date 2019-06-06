import { CallHandler, ExecutionContext, HttpException, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";

import { Configuration } from "../config";
import { Logger, LogMetadata } from "../core";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private logger = new Logger("Request");

  constructor(private config: Configuration) {}

  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const req = context.switchToHttp().getRequest();

    const commonProperties = {
      url: req.originalUrl,
      method: req.method,
    };

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const duration = Date.now() - now;

        const properties = {
          ...commonProperties,
          duration,
          statusCode: response.statusCode,
        };

        this.logger.info(
          `${req.method} ${response.statusCode} ${req.originalUrl} (${duration}ms)`,
          this.clean(properties),
        );
      }),
      catchError((error: Error | HttpException) => {
        const statusCode = error instanceof HttpException ? error.getStatus() : 500;
        const duration = Date.now() - now;
        const message = `${req.method} ${statusCode} ${req.originalUrl} (${duration}ms)`;

        const properties = {
          duration,
          statusCode,
        };

        if (statusCode >= 500) {
          this.logger.error(message, this.clean(properties));
        } else {
          this.logger.info(message, this.clean(properties));
        }
        return throwError(error);
      }),
    );
  }

  private clean(meta: LogMetadata) {
    return this.config.env === "development" ? {} : meta;
  }
}
