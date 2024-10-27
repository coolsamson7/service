import { TypeDescriptor } from "@modulefederation/portal";
import { PluginModule } from "./plugin.module";
import { PluginManager } from "./plugin-manager";
import { PluginDescriptor } from "./plugin-descriptor";

  
export const RegisterPlugin = (name: string): ClassDecorator => {
    return (componentClass: any) => {
     PluginModule.injector.subscribe(injector => {
        const registry = injector.get(PluginManager)
        const plugin =  injector.get(componentClass)

        const descriptor = new PluginDescriptor(registry, name, plugin)

        plugin.descriptor = descriptor
        
        registry.register(name, descriptor)
    
        Reflect.set(componentClass, "$descriptor", descriptor)
     })
    };
};


// callable plugin methods

export interface PublicConf {
    timeout?: number
}

export const Public = (conf : PublicConf = {}) => {
    const timout = conf.timeout || -1

    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => { 
        // remember the decorator

        TypeDescriptor.forType(target.constructor).addMethodDecorator(target, propertyKey, Public)
        
        // override
        
        descriptor.value = function (...args: any[]) {
            const descriptor : PluginDescriptor = <PluginDescriptor>Reflect.get(target.constructor, "$descriptor")

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

    // override

    descriptor.value = function (...args: any[]) {
        const descriptor : PluginDescriptor = <PluginDescriptor>Reflect.get(target.constructor, "$descriptor")

        return descriptor.callback(propertyKey, args)
    };
  
    // done
  
    return descriptor;
  }
  