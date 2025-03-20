import { Injector, ModuleWithProviders, NgModule } from "@angular/core";
import { ReplaySubject } from "rxjs";
import { ModelValidationMessageHandler } from "./validation-message-handler";
import { ValidationModule } from "@modulefederation/common";


// force load

 const handler = [
  ModelValidationMessageHandler
]

console.log(ModelValidationMessageHandler)

@NgModule({
    imports: [
      ValidationModule
    ],
    declarations: [],
    exports: [
      ValidationModule
    ]
  })
  export class ModelValidationModule {
    static injector = new ReplaySubject<Injector>(1);
  
    static forRoot(...validators: any[]): ModuleWithProviders<ModelValidationModule> {
      return {
        ngModule: ModelValidationModule,
        providers: []
      };
    }
  
    constructor(injector: Injector) {
        ModelValidationModule.injector.next(injector);
    }
  }