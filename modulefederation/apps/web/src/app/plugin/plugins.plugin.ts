import { Injectable } from "@angular/core";
import { Public, RegisterPlugin } from "./plugin.decorator";
import { AbstractPlugin } from "./abstract-plugin";
import { PluginManager } from "./plugin-manager";

export interface PluginInfo {
    name: string,
    version: string,
    description: string
}

@RegisterPlugin("plugin-manager")
@Injectable({providedIn: 'root'})
export class PluginsPlugin extends AbstractPlugin {
    // constructor

    constructor(manager: PluginManager) {
        super(manager)
    }

    // public methods

    @Public()
    async plugins() : Promise<PluginInfo[]> {
      return Promise.resolve([])//make the compiler happy
    }
  }
