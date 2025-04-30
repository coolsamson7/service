import { ɵNG_PROV_DEF, ɵNG_COMP_DEF } from '@angular/core';
import { LocaleManager } from './locale.manager';
import { Observable, of } from 'rxjs';
import { OnLocaleChange } from './locale-aware.mixin';


export type ConstructorFunction<T> = new (...args: any[]) => T;

/**
 * this interface specifies translatable options
 */
export interface TranslatableConfig {
  /**
   * optional priority of the translatable object which will determine the order of invocation.
   * Smaller priorities will be invoked earlier. User priorities should start with 1!
   */
  priority?: number;
}

/**
 * registers the class as a translatable object that implements the interface {@link OnLocaleChange}
 * @param config the config object
 * @constructor
 */
export function Translatable(config: TranslatableConfig = { priority: 1 }) {
  if (!config.priority) config.priority = 1;

  return function translatable<T extends ConstructorFunction<OnLocaleChange>>(constructor: T): any | void {
    const injectable = (<any>constructor)[ɵNG_PROV_DEF];

    if (injectable) {
      // If it's an Injectable, hook into it's factory.

      const originalFactory = injectable.factory;

      injectable.factory = function (t: any) {
        import('./locale.module').then((m) => {
          m.LocaleModule.injectorSubject.subscribe((injector) => {
            const localeManager = injector.get(LocaleManager);

           // window['setLocale'] = (locale) => localeManager.setLocale(locale);

            localeManager.subscribe(this.value, config.priority);
          });
        });
        return originalFactory(t);
      };
    } else {
      // Otherwise, it's a Component. Hook into it's constructor.
      return class extends constructor {
        constructor(...args: any[]) {
          super(...args);

          // Augmenting the constructor with additional stuff!
          // We have access to the instance in the runtime!
          import('./locale.module').then((m) => {
            m.LocaleModule.injectorSubject.subscribe((injector) => {
              const localeManager = injector.get(LocaleManager);

             // window['setLocale'] = (locale) => localeManager.setLocale(locale);

              localeManager.subscribe(this, config.priority);
            });
          });
        }
      };
    }
  };
}
