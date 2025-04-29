import { NgModule, Injector } from "@angular/core";
import { ReplaySubject } from "rxjs";
import { ValidateTypeDirective } from "./validate-type.directive";
import { ShowErrorDirective } from "./show-errors.directive";

// force loading

export * from './handler/error-validation-message-handler';

@NgModule({
    imports: [],
    declarations: [
      ValidateTypeDirective,
      ShowErrorDirective,
    ],
    exports: [
      ValidateTypeDirective,
      ShowErrorDirective,
    ]
  })
  export class ValidationModule {
    static injector = new ReplaySubject<Injector>(1);

    static forRoot() {
      return {
        ngModule: ValidationModule,
        providers: []
      };
    }

    constructor(injector: Injector) {
        ValidationModule.injector.next(injector);
    }
  }
