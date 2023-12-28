import { ɵNG_PROV_DEF } from '@angular/core';
import { LocaleManager } from './locale.manager';
import { Observable } from 'rxjs';

/**
 * translatable objects must implement this interface on order to get called about changes
 */
export interface OnLocaleChange {
    /**
     * called whenever the current locale changes
     * @param locale the new locale
     */
    onLocaleChange(locale : Intl.Locale) : Observable<any>;
}

export type ConstructorFunction<T> = new (...args : any[]) => T;

/**
 * this interface specifies translatable options
 */
export interface TranslatableConfig {
    /**
     * optional priority of the translatable object which will determine the order of invocation.
     * Smaller priorities will be invoked earlier. User priorities should start with 1!
     */
    priority? : number;
}

/**
 * registers the class as a translatable object that implements the interface {@link OnLocaleChange}
 * @param config the config object
 * @constructor
 */
export function Translatable(config : TranslatableConfig = {priority: 1}) {
    if (!config.priority) config.priority = 1;

    let subscribe = (onLocaleChange: OnLocaleChange, config : TranslatableConfig): OnLocaleChange => {
        import('./locale.module').then((m) => {
            m.LocaleModule.injectorSubject.subscribe((injector) => {
                const localeManager = injector.get(LocaleManager);

                console.log("### subscribe ")

                console.log(onLocaleChange)

                localeManager.subscribe(onLocaleChange, config.priority);
            });
        });

        return onLocaleChange
    }

    return function translatable<T extends ConstructorFunction<OnLocaleChange>>(constructor : T) : any | void {
        // @ts-ignore
        const injectable = constructor[ɵNG_PROV_DEF];

        if (injectable) {
            console.log("### register ")
            console.log(injectable.factory)
            // If it's an Injectable, hook into its factory.

            const originalFactory = injectable.factory;

            injectable.factory = function (t: any) { console.log("### call " + originalFactory)
                return subscribe(originalFactory(t), config)
            };
        }
        else {
            // Otherwise, it's a Component. Hook into its constructor.
            return class extends constructor {
                constructor(...args : any[]) {
                    super(...args);

                    // Augmenting the constructor with additional stuff!
                    // We have access to the instance in the runtime!

                    import('./locale.module').then((m) => {
                        m.LocaleModule.injectorSubject.subscribe((injector) => {
                            const localeManager = injector.get(LocaleManager);

                            localeManager.subscribe(this, config.priority);
                        });
                    })
                }
            };
        }
    };
}
