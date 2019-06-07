import cls from "cls-hooked";
const ns = cls.createNamespace("Open API Hub Context");

export interface HubContext {
  requestId: string;
}

export function getContext<K extends keyof HubContext>(key: K): HubContext[K] | undefined {
  if (!ns || !ns.active) {
    return undefined;
  }

  return ns.get(key);
}

export function setContext<K extends keyof HubContext>(key: K, value: HubContext[K]) {
  if (!ns || !ns.active) {
    return;
  }

  return ns.set(key, value);
}

export function runInContext(func: (...args: unknown[]) => unknown) {
  ns.run(func);
}
