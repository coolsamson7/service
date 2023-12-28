import { InjectionToken, Injector, ModuleWithProviders, NgModule } from '@angular/core';
import { AbstractModule } from "../injection";

/**
 * @ignore
 */
export const LocaleConfigInjectionToken = new InjectionToken<LocaleConfig>('LoaderConfigInjectionToken');

/**
 * the config object for the locale module
 */
export interface LocaleConfig {
    /**
     * teh initial locale
     */
    locale? : string | Intl.Locale;
    /**
     * the array of supported locales
     */
    supportedLocales? : string[];

    /**
     * any additional properties
     */
    [prop : string] : any;
}

/**
 * the locale module
 */
@NgModule({
    imports: [],
    declarations: [],
    exports: []
})
export class LocaleModule extends AbstractModule() {
    // constructor

    constructor(injector : Injector) {
        super(injector);
    }

    // static methods

    /**
     * configure the locale module
     * @param config the {@link LocaleConfig}
     */
    static forRoot(config : LocaleConfig = {}) : ModuleWithProviders<LocaleModule> {
        return {
            ngModule: LocaleModule,
            providers: [
                {
                    provide: LocaleConfigInjectionToken,
                    useValue: config
                }
            ]
        };
    }
}
