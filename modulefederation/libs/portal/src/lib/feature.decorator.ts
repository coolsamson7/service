import { forwardRef, Type, ɵDirectiveDef, ɵNG_COMP_DEF, ɵɵProvidersFeature as providersFeature, Provider } from '@angular/core';

const identity = (...args: any[]) => args[0]


import { FeatureConfig } from "./feature-config";
import { AbstractFeature } from './feature/abstract-feature';

export function Feature(config : FeatureConfig) {
    return (clazz: Type<any>) => { // TODO
        (<any>clazz)['$$config'] = config;
        clazz.prototype.$$config = config;
    
        const componentDef = (clazz as any)[ɵNG_COMP_DEF];
    
        // remember
    
        config.componentDefinition = componentDef;
    
        // If no providers specified, i.e. no providersFeature is present,
        // apply one manually.
        // More on feature:
        // https://github.com/angular/angular/blob/master/packages/core/src/render3/features/providers_feature.ts
        if (!componentDef.providersResolver) {
          providersFeature([])(componentDef);
        }
    
        // Take the original providers resolver
    
        const originalProvidersResolver = componentDef.providersResolver;
    
        componentDef.providersResolver = (def: ɵDirectiveDef<any>, processProvidersFn?: (providers: Provider[]) => Provider[]) => {
          originalProvidersResolver(def, (providers: Provider[]) => {
            const processedProviders = (processProvidersFn || identity)(providers);
            
            return [
              ...processedProviders,
    
              // Add one more provider to the list
    
              { 
                provide: AbstractFeature, 
                useExisting: forwardRef(() => clazz) 
              }
            ];
          });
        };
      };
    }