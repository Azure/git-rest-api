import { CallHandler, ExecutionContext, HttpException, HttpStatus, Injectable, NestInterceptor } from "@nestjs/common";
import { Request } from "express";
import { Observable, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";

import { Configuration } from "../config";
import { LogMetadata, Logger, Telemetry } from "../core";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private logger = new Logger("Request");

  constructor(private config: Configuration, private telemetry: Telemetry) {}

  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const req: Request = context.switchToHttp().getRequest();

    const commonProperties = {
      path: req.route.path,
      method: req.method,
    };

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const duration = Date.now() - now;

        const properties = {
          ...commonProperties,
          duration,
          status: response.statusCode,
        };

        const message = `${req.method} ${response.statusCode} ${req.originalUrl} (${duration}ms)`;
        this.logger.info(message, this.clean(properties));
        this.trackRequest(properties);
      }),
      catchError((error: Error | HttpException) => {
        const statusCode = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        const duration = Date.now() - now;
        const message = `${req.method} ${statusCode} ${req.originalUrl} (${duration}ms)`;

        const properties = {
          ...commonProperties,
          duration,
          status: statusCode,
        };

        this.trackRequest(properties);
        if (statusCode >= 500) {
          this.logger.error(message, this.clean(properties));
          this.telemetry.emitMetric({
            name: "EXCEPTIONS",
            value: 1,
            dimensions: {
              type: error.name,
              path: properties.path,
              method: properties.method,
            },
          });
        } else {
          this.logger.info(message, this.clean(properties));
        }
        return throwError(error);
      }),
    );
  }

  private trackRequest(properties: { duration: number; path: string; method: string; status: number }) {
    const { duration, status, ...otherProperties } = properties;
    this.telemetry.emitMetric({
      name: "INCOMING_REQUEST",
      value: 1,
      dimensions: {
        status: status.toString(),
        ...otherProperties,
      },
    });
    this.telemetry.emitMetric({
      name: "INCOMING_REQUEST_DURATION",
      value: duration,
      dimensions: {
        status: status.toString(),
        ...otherProperties,
      },
    });
  }

  private clean(meta: LogMetadata) {
    return this.config.env === "development" ? {} : meta;
  }
}
