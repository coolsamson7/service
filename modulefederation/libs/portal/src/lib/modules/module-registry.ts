import {Injectable} from '@angular/core';
import {ModuleMetadata} from './module.interface';

/**
 * A <code>ModuleRegistry</code> keeps track of - specifically decorated - modules, including their
 * <ul>
 *   <li>meta-data fetched from package.json and</li>
 *   <li>their loaded status</li>
 * </ul>
 */
@Injectable({providedIn: 'root'})
export class ModuleRegistry {
    // instance data

    /**
     * the map of module meta-data
     */
    modules : { [name : string] : ModuleMetadata } = {}

    // constructor

    /**
     * create a new {@link ModuleRegistry}
     */
    constructor() {
        ;(window as any)["modules"] = () => {
            this.report()
        }
    }

    // public

    report() {
        console.table(this.modules, ["name", "type", "version", "isLoaded"])
    }

    /**
     * register module metadata
     * @param metadata meta data
     */
    register(metadata : ModuleMetadata) {
      // leave registered moduels as is ( in case of a redeployment )
        if ( !this.modules[metadata.name])
          this.modules[metadata.name] = metadata
    }

    /**
     * mark the specified module as loaded
     * @param metadata the module meta-data
     */
    markAsLoaded(metadata : ModuleMetadata) {
        if (this.modules[metadata.name])
            this.modules[metadata.name].isLoaded = true
    }
}
