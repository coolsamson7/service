import { PluginRegistry } from "./plugin-registry"
import { Plugin } from "./plugin"
import { MethodDescriptor, Type, TypeDescriptor } from "@modulefederation/portal"
import { Callback, Public } from "./plugin.decorator"

interface CallbackMethod {
    descriptor: MethodDescriptor
    method: any
    listener: any[]
}

interface PluginMethod {
    descriptor: MethodDescriptor
    method: any
}

export class PluginDescriptor {
    // instance data

    methods: { [key: string]: PluginMethod } = {};
    callbacks: { [key: string]: CallbackMethod } = {};

    // constructor

    constructor(public registry: PluginRegistry, public name: string, public instance: Plugin) {
       this. analyze(instance)
    }

    // private

    private analyze(instance : Plugin) {
        const descriptor = TypeDescriptor.forType(instance.constructor as Type<any>)

        for ( const method of descriptor.getMethods())
            if ( method.hasDecorator(Public)) {
                this.methods[method.name] = {
                    descriptor: method,
                    method: (<any>this.instance)[method.name]
                }
            }
            else if ( method.hasDecorator(Callback)) {
                this.callbacks[method.name] = {
                    descriptor: method,
                    method: (<any>this.instance)[method.name],
                    listener: []
                }
             }
    }

    // public

    execute(method: string, args: any[]) {
        const descriptor = this.methods[method]

        return descriptor.method.apply(this.instance, args)
    }
    
    // called from the modified method

    call(method: string, args: any[], timeout: number) : any {
        const descriptor = this.methods[method]

        return this.registry.execute({
            plugin: this.name,
            method: method,
            args: args
        }, descriptor.descriptor.returnType, timeout)
    }

    callback(method: string, args: any[]) : any {
        const listeners = this.callbacks[method].listener

        for ( const listener of listeners)
            listener(...args);
    }
  }