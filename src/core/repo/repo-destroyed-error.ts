export class RepositoryDestroyedError extends Error {
  constructor(public path: string) {
    super(
      `Cannot access repository that was destroyed. There must be an issue.` +
        ` Make sure to call .lock() Path: ${path}`,
    );
  }
}
