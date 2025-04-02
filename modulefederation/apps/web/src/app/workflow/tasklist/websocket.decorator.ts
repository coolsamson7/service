import { TypeDescriptor } from "@modulefederation/portal";
import { WebsocketHandlerDescriptor } from "./websocket-handler";
import { WebsocketManager } from "./websocket-manager";
import { WebsocketModule } from "./websocket.module";

export const Handler = (name: string): ClassDecorator => {
    return (handlerClass: any) => {
     WebsocketModule.injector.subscribe(injector => {
        const manager =  injector.get(WebsocketManager)
        const handler =  injector.get(handlerClass)

        Reflect.set(handlerClass, "$descriptor", new WebsocketHandlerDescriptor(manager, name, handler))
     })
    };
};


// callable plugin methods

export interface PublicConf {
    timeout?: number
}

export const Call = (conf : PublicConf = {}) => {
    const timout = conf.timeout || -1

    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        // remember the decorator

        TypeDescriptor.forType(target.constructor).addMethodDecorator(target, propertyKey, Call)

        // override

        descriptor.value = function (...args: any[]) {
            const descriptor : WebsocketHandlerDescriptor = <WebsocketHandlerDescriptor>Reflect.get(target.constructor, "$descriptor")

            return descriptor.call(propertyKey, args, timout)
        };

        // done

        return descriptor;
    }
}

  // callback methods

  export const Callback = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    // remember the decorator

    TypeDescriptor.forType(target.constructor).addMethodDecorator(target, propertyKey, Callback)


    // done

    return descriptor;
  }