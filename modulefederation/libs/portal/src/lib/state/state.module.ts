import { InjectionToken, ModuleWithProviders, NgModule, Type } from '@angular/core';
import { LocalStorageStateStorage, StateStorage } from './state-storage';

export interface  StateConfiguration {
    storage?: Type<StateStorage>
}

export const StateConfigurationInjectionToken = new InjectionToken<StateConfiguration>('StateConfigurationInjectionToken');

/**
 * The module for the state stuff
 */
@NgModule({
  imports: [],
  declarations: [],
  exports: []
})
export class StateModule {
       public static forRoot(configuration : StateConfiguration) : ModuleWithProviders<StateModule> {
        return {
            ngModule: StateModule,
            providers: [
                {
                    provide: StateConfigurationInjectionToken,
                    useValue: StateModule
                },
                {
                    provide: StateStorage,
                    useClass: configuration.storage || LocalStorageStateStorage
                  }
            ]
        };
    }
}
