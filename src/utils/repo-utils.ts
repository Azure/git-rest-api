export const RepoUtils = {
  getUrl: (remote: string) => {
    const suffix = remote.endsWith(".git") ? "" : ".git";
    return `https://${remote}${suffix}`;
  },
};
