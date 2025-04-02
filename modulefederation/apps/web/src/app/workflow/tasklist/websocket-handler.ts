import { MethodDescriptor, Type, TypeDescriptor } from "@modulefederation/portal"
import { WebsocketManager } from "./websocket-manager";
import { Call, Callback } from "./websocket.decorator";


export class HandlerMethod {
    constructor(public descriptor: MethodDescriptor, public instance: any, public method: any) {}

    // public

    apply(args: any[]) : any {
        return this.method.apply(this.instance, args)
    }
}

export class WebsocketHandlerDescriptor {
    // instance data

    methods: { [key: string]: HandlerMethod } = {};
    callbacks: { [key: string]: HandlerMethod } = {};

    // constructor

    constructor(private websocketManager: WebsocketManager, public name: string, public instance: any) {
       this.analyze(instance)

       for ( const callback in this.callbacks)
        websocketManager.registerCallback(callback, this.callbacks[callback])
    }

    // private

    private analyze(instance : any) {
        const descriptor = TypeDescriptor.forType(instance.constructor as Type<any>)

        for ( const method of descriptor.getMethods())
            if ( method.hasDecorator(Call)) 
                this.methods[method.name] =  new HandlerMethod(method, instance, (<any>this.instance)[method.name])
            
            else if ( method.hasDecorator(Callback)) 
                this.callbacks[method.name] = new HandlerMethod(method, instance, (<any>this.instance)[method.name])
    }

    // called from the modified method

    call(method: string, args: any[], timeout: number) : any {
        const descriptor = this.methods[method]

        return this.websocketManager.execute({
            request: method,
            args: args
        }, descriptor.descriptor.returnType, timeout)
    }
  }
