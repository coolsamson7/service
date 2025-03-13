import { Injector, NgModule } from '@angular/core';
import { StateDescriptor } from './state-descriptor';
import { ReplaySubject } from 'rxjs';

/**
 * The module for the state stuff
 */
@NgModule({
  imports: [],
  declarations: [],
  exports: []
})
export class StateManagerModule {
  static descriptors: StateDescriptor[] = [];

  static injector = new ReplaySubject<Injector>(1);
    
  static forRoot() {
    return {
      ngModule: StateManagerModule,
      providers: []
    };
  }

  constructor(injector: Injector) {
    StateManagerModule.injector.next(injector);
  }
}
