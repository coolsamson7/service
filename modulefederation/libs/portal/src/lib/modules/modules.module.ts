import { ReplaySubject } from 'rxjs';
import { Injector, NgModule } from '@angular/core';
import { ModuleRegistry } from './module-registry';

/**
 * the modules module
 */
@NgModule({
  imports: [],
  providers: [ModuleRegistry]
})
export class ModulesModule {
  static injector = new ReplaySubject<Injector>(1);

  constructor(injector: Injector) {
    ModulesModule.injector.next(injector);
  }
}
