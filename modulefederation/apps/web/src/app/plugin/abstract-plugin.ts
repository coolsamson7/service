
import { Plugin } from "./plugin";
import { PluginDescriptor } from "./plugin-descriptor";
import { PluginManager } from "./plugin-manager";

export class AbstractPlugin implements Plugin {
    // instance data

    descriptor: PluginDescriptor | undefined;

    // constructor

    constructor(protected manager: PluginManager) {
        //const decorator : RegisterPlugin  = TypeDescriptor.forType(this.constructor as Type<any>).typeDecorators.find(decorator => decorator instanceof RegisterPlugin)
    }
  

    // callbacks

    listen2(method: string, callback: (...args: any[]) => void) {
        //this.manager.listen2(this.descriptor!, method, callback)

        this.descriptor?.callbacks[method].listener.push(callback)
    }

    // public

    name() : string {
        return this.descriptor!.name
    }

    // implement plugin

    startup() : void {
    }

    shutdown() : void { 
    } 
}

  