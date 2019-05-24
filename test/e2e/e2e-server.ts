import fetch, { RequestInit, Response } from "node-fetch";

const testUrl = process.env.GIT_REST_API_E2E_ENDPOINT || "http://localhost:3009";

class E2EClient {
  public fetch(uri: string, init?: RequestInit): Promise<Response> {
    return fetch(`${testUrl}${uri}`, init);
  }
}

export const e2eClient = new E2EClient();
export const UNENCODED_TEST_REPO = "github.com/test-repo-billy/git-api-tests";
export const TEST_REPO = encodeURIComponent(UNENCODED_TEST_REPO);
