import { Injectable } from "@nestjs/common";

import { SecureUtils } from "../../utils";

export enum TokenPermission {
  None,
  Read,
  Write,
}

const TOKEN_INVALIDATE_TIMEOUT = 60_000; // 60s

@Injectable()
export class PermissionService {
  private tokenPermissions = new Map<string, TokenPermission>();
  private timeouts = new Map<string, NodeJS.Timeout>();

  public getTokenPermission(token: string, remote: string): TokenPermission | undefined {
    return this.tokenPermissions.get(this.getMapKey(token, remote));
  }

  public setTokenPermission(token: string, remote: string, permission: TokenPermission) {
    const key = this.getMapKey(token, remote);
    this.tokenPermissions.set(key, permission);
    this.timeoutPermission(key);
  }

  /**
   * Remove the cached permission after a timeout
   */
  private timeoutPermission(key: string) {
    const existingTimeout = this.timeouts.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      this.timeouts.delete(key);
    }

    this.timeouts.set(
      key,
      setTimeout(() => {
        this.tokenPermissions.delete(key);
        this.timeouts.delete(key);
      }, TOKEN_INVALIDATE_TIMEOUT),
    );
  }

  private getMapKey(token: string, remote: string) {
    return `${this.hashToken(token)}/${remote}`;
  }

  private hashToken(token: string): string {
    return SecureUtils.sha512(token);
  }
}
