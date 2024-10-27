import { PluginDescriptor } from "./plugin-descriptor";

export interface Plugin {
    descriptor: PluginDescriptor | undefined

    startup() : void
    
    shutdown() : void
  }
  


  
  