import { TypeDescriptor } from "../reflection"

import { ErrorManager } from "./error-manager"
import { Constructor } from "../common/lang/constructor.type";

/**
 * decorates classes that contain error handlers. The class will be instantiated and registered with the {@link ErrorManager}
 */
export const ErrorHandler = (): any => {
    return (clazz: Constructor<any>) => {
      TypeDescriptor.forType(clazz).addTypeDecorator(ErrorHandler)

      import('./error.module').then((m) => {
        m.ErrorModule.injectorSubject.subscribe((injector) => {
          const manager = injector.get(ErrorManager);

          const handler = injector.get(clazz);

          manager.registerHandler(handler);
        });
      })
    }
}

/**
 * decorated that marks method to handle errors of a specific type ( of the single parameter )
 */
export function HandleError(): any {
    return function (target: any, propertyKey: string, propertyDescriptor: PropertyDescriptor) {
      TypeDescriptor.forType(target.constructor).addMethodDecorator(target, propertyKey, HandleError)
    }
}
