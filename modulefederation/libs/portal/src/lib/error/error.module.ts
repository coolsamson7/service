import { Injector, NgModule } from '@angular/core';
import { AbstractModule } from '../injection';

/**
 * Module for the error handling stuff.
 */
@NgModule({
  imports: [],
  declarations: [],
  exports: []
})
export class ErrorModule extends AbstractModule() {
  // constructor

  constructor(injector: Injector) {
    super(injector)
  }
}
