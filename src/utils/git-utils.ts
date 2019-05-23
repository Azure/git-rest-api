export interface RemoteRef {
  ref: string;
  remote: string;
}

export const GitUtils = {
  /**
   * Parse a remote reference
   * Can be in the follow format:
   *  - "{ref}"
   *  - "{remote}:{ref}"
   * @param name Reference name
   */
  parseRemoteReference: (name: string, defaultRemote: string): RemoteRef => {
    if (name.includes(":")) {
      const [remote, ref] = name.split(":");
      return {
        remote,
        ref,
      };
    } else {
      return { ref: name, remote: defaultRemote };
    }
  },
};
