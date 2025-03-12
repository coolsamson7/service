import { Injector, ModuleWithProviders, NgModule } from "@angular/core";
import { ReplaySubject } from "rxjs";
import { ExtensionValidator } from "./validator/extension-validator";
import { InputOutputValidator, InputParameterValidator } from "./validator/input-output-validator";
import { TaskValidator } from "./validator/task-validator";
import { SchemaPropertyValidator, SchemaValidator } from "./validator/schema-validator";

@NgModule({
    imports: [
    ],
    declarations: [],
    exports: []
  })
  export class ValidationModule {
    static injector = new ReplaySubject<Injector>(1);
  
    static forRoot(): ModuleWithProviders<ValidationModule> {
      return {
        ngModule: ValidationModule,
        providers: []
      };
    }
  
    constructor(injector: Injector) {
        ValidationModule.injector.next(injector);
    }
  }

  // todo module parameter

  const validators= [ 
    ExtensionValidator, 
    InputOutputValidator, 
    InputParameterValidator,
    TaskValidator,
    SchemaValidator,
    SchemaPropertyValidator
  ]