import { PluginDescriptor } from "./plugin-descriptor";
import { PluginRequest } from "./plugin-manager";

export abstract class PluginRegistry {
    // instance data

    private plugins: { [key: string]: PluginDescriptor } = {};

    // constructor

    protected constructor() {
    }
      
    // public
  
    register(name: string, plugin: PluginDescriptor) {
        this.plugins[name] = plugin
    }

    plugin(pluginName: string) : PluginDescriptor {
        const plugin = this.plugins[pluginName]

        if ( plugin)
            return plugin
        else
            throw new Error(`unknown plugin ${plugin}`)
    }

    abstract execute(request: PluginRequest, expectedValue: any, timeout: number) : Promise<any> | undefined
}

