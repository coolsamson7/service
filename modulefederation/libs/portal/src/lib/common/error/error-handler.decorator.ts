import { TypeDescriptor } from "../reflection"

/**
 * decorated that marks method to handle errors of a specific type ( of the single parameter )
 */
export function ErrorHandler(): any {
    return function (target: any, propertyKey: string, propertyDescriptor: PropertyDescriptor) {
      TypeDescriptor.forType(target.constructor).addMethodDecorator(target, propertyKey, ErrorHandler)
    }
}
