import {
    Provider,
    Type,
    ɵNG_COMP_DEF as NG_COMP_DEF,
    ɵNG_INJ_DEF as NG_INJ_DEF,
    ɵɵProvidersFeature as providersFeature
} from '@angular/core';

/**
 * Adds providers to the Component or NgModule.
 * Commonly used in Decorators to e.g. pass the config via injection.
 * TODO: add the variant for Injectable (piece o' cake)
 */
export const addProviders = (toClass : Type<any>, providers : Provider[]) => {
    const componentDef = (toClass as any)[NG_COMP_DEF];

    if (componentDef) {
        if (!componentDef.providersResolver) {
            providersFeature([])(componentDef);
        }

        // Take the original providers resolver
        const originalProvidersResolver = componentDef.providersResolver;

        componentDef.providersResolver = (def : any, processProvidersFn? : any) => {
            originalProvidersResolver(def, (providers : any) => {
                const processedProviders = processProvidersFn(providers);
                return [
                    ...processedProviders,
                    // Add one more provider to the list
                    ...providers
                ];
            });
        };
    }
    else {
        // Else, it's applied on the NgModule.
        // Add a provider for this module.
        const injection = (toClass as any)[NG_INJ_DEF];
        injection.providers.push(...providers);
    }
};
