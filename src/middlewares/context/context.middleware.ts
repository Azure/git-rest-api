import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import uuid from "uuid/v4";

import { runInContext, setContext } from "../../core";

@Injectable()
export class ContextMiddleware implements NestMiddleware {
  public use(request: Request, response: Response, next: NextFunction) {
    runInContext(() => {
      injectRequestId(request, response);
      next();
    });
  }
}

declare global {
  namespace Express {
    export interface Request {
      requestId: string;
    }
  }
}

function injectRequestId(request: Request, response: Response) {
  const id = uuid();
  request.requestId = id;

  setContext("requestId", id);
  response.setHeader("x-request-id", id);
}
