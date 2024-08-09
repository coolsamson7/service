import { NgModule, Injector } from "@angular/core";
import { ValidationModule } from "@modulefederation/common";
import { ReplaySubject } from "rxjs";
import { BooleanValidationMessageProvider, NumberValidationMessageProvider } from "./provider";

// force loading

export * from './provider';
export * from './handler';

const a = BooleanValidationMessageProvider
const b = NumberValidationMessageProvider

@NgModule({
    imports: [/*ValidationModule*/],
    declarations:  [],
    exports: []
  })
  export class PortalValidationModule {
    static injector = new ReplaySubject<Injector>(1);
  
    static forRoot() {
      return {
        ngModule: PortalValidationModule,
        providers: []
      };
    }
  
    constructor(injector: Injector) {
        PortalValidationModule.injector.next(injector);
    }
  }