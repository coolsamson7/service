import { ErrorHandler, Injector, ModuleWithProviders, NgModule, Type } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { GlobalErrorHandler } from './global-error-handler';
import { ErrorManager } from './error-manager';
import { AbstractModule } from '../../injection';
import { HTTPErrorInterceptor } from '../communication';

export interface ErrorModuleConfig {
  handler: Type<any>[]
}

/**
 * Module for the error handling stuff.
 */
@NgModule({
  imports: [],
  declarations: [],
  exports: []
})
export class ErrorModule extends AbstractModule() {
  // static data

  private static handler: Type<any>[] = []

  // static methods

  static forRoot(config : ErrorModuleConfig) : ModuleWithProviders<ErrorModule> {
        ErrorModule.handler = config.handler

        return {
            ngModule: ErrorModule,

            providers: [
                {
                  provide: ErrorHandler,
                  useClass: GlobalErrorHandler
                },
                {
                  provide: HTTP_INTERCEPTORS,
                  useClass: HTTPErrorInterceptor,
                  multi: true
              }
            ]
        }
  }

  // constructor

  constructor(injector: Injector) {
    super(injector)

    // create and register the handlers

    const manager = injector.get(ErrorManager)

    for (const handler of  ErrorModule.handler)
      manager.registerHandler(injector.get(handler))
  }
}
