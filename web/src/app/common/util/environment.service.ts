import { ModuleWithProviders, NgModule } from "@angular/core";

export class Environment {
    // constructor

    constructor(private environment: any) {}

    // public

    get<T>(key: string, defaultValue: T | undefined = undefined): T | undefined {
        const path = key.split(".")

        let index = 0
        const length = path.length

        let object = this.environment

        while (object != null && index < length)
           object = Reflect.get(object, path[index++])

        return index && index == length ? <T>object : defaultValue
    }
}

@NgModule({
    imports: [],
    providers: [],
    declarations: [],
    exports: [],
  })
  export class EnvironmentModule {
    static forRoot(environment: any): ModuleWithProviders<EnvironmentModule> {
      return {
        providers: [{provide: Environment, useValue: new Environment(environment)}],
        ngModule: EnvironmentModule,
      };
    }
  }