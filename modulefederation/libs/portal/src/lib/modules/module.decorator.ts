import { InjectionToken, Type } from '@angular/core';
import { ModuleMetadata } from './module.interface';
import { addProviders } from '@modulefederation/common';

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

        Reflect.set(componentClass, "$$metadata", metadata);
    };
}
