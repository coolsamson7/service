import { NgModule, Injector } from "@angular/core";
import { ReplaySubject } from "rxjs";
import { ValidateTypeDirective } from "./validate-type.directive";
import { ShowError1Directive, ShowErrorDirective } from "./show-errors.directive";

// force laoding

export * from './handler/error-validation-message-handler';

@NgModule({
    imports: [],
    declarations: [
      ValidateTypeDirective,
      ShowErrorDirective,
      ShowError1Directive
    ],
    exports: [
      ValidateTypeDirective,
      ShowErrorDirective,
      ShowError1Directive
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