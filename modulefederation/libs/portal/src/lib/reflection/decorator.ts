import { TypeDescriptor } from "./type-descriptor";

/**
 * a <code>Decorator</code> is able to modify a newly created instance
 * @param T the expected class type
 */
export interface Decorator<T = any> {
  decorate(type: TypeDescriptor<T>, instance: T): void
}
