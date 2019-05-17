import { Injectable } from "@nestjs/common";
import fetch, { RequestInit, Response } from "node-fetch";

@Injectable()
export class HttpService {
  public fetch(uri: string, init?: RequestInit): Promise<Response> {
    return fetch(uri, init);
  }
}
