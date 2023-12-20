/**
 * the type of a constructor
 */
export type Constructor<T> = { new(...args : unknown[]) : T }
