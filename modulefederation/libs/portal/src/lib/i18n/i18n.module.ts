import { InjectionToken, ModuleWithProviders, NgModule, Type } from '@angular/core';
import { I18nLoader } from './i18n.loader';
import { DefaultMissingTranslationHandler, MissingTranslationHandler, Translator } from './translator';
import { TranslatePipe } from './translate.pipe';
import { FormatterModule } from './formatter';
import { DefaultTranslator } from './translator/default-translator';
import { LocaleModule } from '../locale';

/**
 * @ignore
 */
export const TranslationLoaderConfigInjectionToken = new InjectionToken<TranslationLoaderConfig>(
    'LoaderConfigInjectionToken'
);

/**
 * the configuration object for the concrete {@link I18nLoader}
 */
export interface TranslationLoaderConfig {
    /**
     * the  {@link I18nLoader} class
     */
    type? : Type<I18nLoader>;

    /**
     * any additional arguments
     */
    [prop : string] : any;
}

/**
 * @ignore
 */
export const TranslatorTranslatorConfigInjectionToken = new InjectionToken<TranslationTranslatorConfig>(
    'TranslatorConfigInjectionToken'
);

/**
 * the configuration object for the concrete {@link Translator}
 */
export interface TranslationTranslatorConfig {
    /**
     * the  {@link MissingTranslationHandler} class
     */
    type? : Type<Translator>;

    // the rest...
    /**
     * any additional arguments
     */
    [prop : string] : any;
}

/**
 * the configuration object for the concrete {@link MissingTranslationHandler}
 */
export interface MissingTranslationHandlerConfig {
    /**
     * the  {@link MissingTranslationHandler} class
     */
    type? : Type<MissingTranslationHandler>;

    // the rest...
    /**
     * any additional arguments
     */
    [prop : string] : any;
}

/**
 * the config object for the i18n module
 */
export type I18nModuleConfig = {
    /**
     * the loader config object
     */
    loader? : TranslationLoaderConfig;
    /**
     * the translator config object
     */
    translator? : TranslationTranslatorConfig;
    /**
     * the missing translation handler config object
     */
    missingTranslationHandler? : MissingTranslationHandlerConfig;
};

/**
 * the main i18n module
 */
@NgModule({
    imports: [FormatterModule, LocaleModule],
    declarations: [TranslatePipe],
    exports: [TranslatePipe]
})
export class I18nModule {
    static forRoot(config : I18nModuleConfig = {}) : ModuleWithProviders<I18nModule> {
        return {
            ngModule: I18nModule,

            providers: [
                {
                    provide: TranslationLoaderConfigInjectionToken,
                    useValue: config.loader ?? {}
                },
                {
                    provide: TranslatorTranslatorConfigInjectionToken,
                    useValue: config.translator ?? {}
                },
                {
                    provide: I18nLoader,
                    useClass: config.loader!!.type!!
                },
                {
                    provide: Translator,
                    useClass: config.translator?.type || DefaultTranslator
                },
                {
                    provide: MissingTranslationHandler,
                    useClass: config.missingTranslationHandler?.type || DefaultMissingTranslationHandler
                }
            ]
        };
    }
}
