import { Injectable } from '@angular/core';
import { ModuleMetadata } from './module.interface';
import { TraceLevel, Tracer } from '../tracer';

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
        if ( Tracer.ENABLED)
            Tracer.Trace("portal", TraceLevel.FULL, "new module registry")

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
        if ( Tracer.ENABLED)
            Tracer.Trace("portal", TraceLevel.FULL, "register module {0}", metadata.name)

        // leave registered modules as is ( in case of a redeployment )

        let entry = this.modules[metadata.name]
        if (!entry)
            this.modules[metadata.name] = metadata
        else {
            // stupid timing problems
            this.modules[metadata.name] = {...metadata, ...entry}
        }
    }

    /**
     * mark the specified module as loaded
     * @param metadata the module meta-data
     */
    markAsLoaded(metadata : ModuleMetadata) {
        if ( Tracer.ENABLED)
            Tracer.Trace("portal", TraceLevel.FULL, "loaded module {0}", metadata.name)

        if (this.modules[metadata.name])
            this.modules[metadata.name].isLoaded = true
        else {
            metadata.isLoaded = true
            this.modules[metadata.name] = metadata
        }

    }
}
