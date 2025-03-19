import { Injector, ModuleWithProviders, NgModule } from "@angular/core";
import { ReplaySubject } from "rxjs";

@NgModule({
    imports: [
    ],
    declarations: [],
    exports: []
  })
  export class ValidationModule {
    static injector = new ReplaySubject<Injector>(1);
  
    static forRoot(...validators: any[]): ModuleWithProviders<ValidationModule> {
      return {
        ngModule: ValidationModule,
        providers: []
      };
    }
  
    constructor(injector: Injector) {
        ValidationModule.injector.next(injector);
    }
  }