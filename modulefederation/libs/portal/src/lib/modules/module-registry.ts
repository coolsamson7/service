import { Injectable } from '@angular/core';
import { ModuleMetadata } from './module.interface';

/**
 * A <code>ModuleRegistry</code> keeps track of - specifically decorated - modules, including their
 * <ul>
 *   <li>meta-data fetched from package.json and</li>
 *   <li>their loaded status</li>
 * </ul>
 */
@Injectable({ providedIn: 'root' })
export class ModuleRegistry {
  // instance data

  /**
   * the map of module meta-data
   */
  modules: [ModuleMetadata, boolean][] = [];

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
    console.table(this.modules.map(item => item[0]))
  }

  /**
   * register module metadata
   * @param metadata meta data
   */
  register(metadata: ModuleMetadata) {
    const { type, name } = metadata;

    const module = this.modules.find(([m]) => m.name === name && m.type === type);

    if (!module) this.modules.push([metadata, false]);

    // toDO



    //if (Tracer.ENABLED) this.tracer.trace('portal', TraceLevel.MEDIUM, "'{0}' {1} is registered", name, type);
  }

  /**
   * mark the specified module as loaded
   * @param metadata the module meta-data
   */
  markAsLoaded(metadata: ModuleMetadata) {
    const { type, name } = metadata;

    const module = this.modules.find(([m]) => m.name === name && m.type === type);

    if (module) {
      module[1] = true;
    }
    else {
      // Module is loaded before it's registered. It's OK.
      // It's because of how decorators work.
      this.modules.push([metadata, true]);
    }

    console.table(this.modules)

    //if (Tracer.ENABLED) this.tracer.trace('portal', TraceLevel.MEDIUM, "'{0}' {1} is loaded", name, type);
  }
}
