import {InjectionToken, Type} from '@angular/core';
import {ModuleMetadata} from './module.interface';

import {ModuleRegistry} from './module-registry';
import {addProviders} from '../util/add-providers';

/**
 * Abstract decorator for modules.
 * Automatically adds a provider for metadata.
 */
export function Module(metadata : ModuleMetadata, token : InjectionToken<ModuleMetadata>) {
    return (componentClass : Type<any>) => {
        addProviders(componentClass, [
            {
                provide: token,
                useValue: metadata
            }
        ]);

        import('./modules.module').then((m) => {
            m.ModulesModule.injector.subscribe((injector) => {
                const runtimeRegistry = injector.get(ModuleRegistry);

                runtimeRegistry.markAsLoaded(metadata);
            });
        });
    };
}
