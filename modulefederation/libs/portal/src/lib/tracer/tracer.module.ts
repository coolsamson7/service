import {ModuleWithProviders, NgModule} from '@angular/core';
import {Tracer} from './tracer';
import {TracerConfiguration, TracerConfigurationInjectionToken} from './tracer-configuration';

/**
 * the tracer module
 */
@NgModule({
    imports: [],
    declarations: [],
    exports: [],
    providers: [Tracer]
})
export class TracerModule {
    /**
     * configure the tracing module
     * @param tracerConfiguration the configuration object
     */
    public static forRoot(tracerConfiguration : TracerConfiguration) : ModuleWithProviders<TracerModule> {
        return {
            ngModule: TracerModule,
            providers: [
                {
                    provide: TracerConfigurationInjectionToken,
                    useValue: tracerConfiguration
                }
            ]
        };
    }
}
