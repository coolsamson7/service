/**
 * the type of a constructor
 */
export type Constructor<T> = { new(...args: unknown[]): T }

export type GConstructor<T = any> = new (...args: any[]) => T;
