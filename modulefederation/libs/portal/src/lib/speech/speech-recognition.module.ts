/* eslint-disable @typescript-eslint/ban-types */

import { InjectionToken, Injector, ModuleWithProviders, NgModule, Type } from '@angular/core';
import { AbstractModule } from "../injection";
import { SpeechEngine } from './speech-engine';
import { WebkitSpeechEngine } from './engine/webspeech-engine';

/**
 * @ignore
 */
export const SpeechRecognitionConfigInjectionToken = new InjectionToken<SpeechRecognitionConfig>('SpeechRecognitionConfigInjectionToken');

/**
 * the config object for the speech module
 */
export interface SpeechRecognitionConfig {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    //maxAlternatives: number;

    engine?: Type<SpeechEngine>

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
export class SpeechRecognitionModule extends AbstractModule() {
    // constructor

    constructor(injector : Injector) {
        super(injector);
    }

    // static methods

    /**
     * configure the locale module
     * @param config the {@link SpeechRecognitionConfig}
     */
    static forRoot(config : SpeechRecognitionConfig = {lang: 'en-US', continuous: true, interimResults: false, engine: WebkitSpeechEngine}) : ModuleWithProviders<SpeechRecognitionModule> {
        return {
            ngModule: SpeechRecognitionModule,
            providers: [
                {
                    provide: SpeechRecognitionConfigInjectionToken,
                    useValue: config
                },
                {
                    provide: SpeechEngine,
                    useClass: config.engine || WebkitSpeechEngine
                },
            ]
        };
    }
}