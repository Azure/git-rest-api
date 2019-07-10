export const notUndefined = <T>(x: T | undefined): x is T => x !== undefined;
export const delay = (timeout?: number) => new Promise(r => setTimeout(r, timeout));
export const parseBooleanFromURLParam = (bool: string | undefined) => bool !== "false" && bool !== undefined;
