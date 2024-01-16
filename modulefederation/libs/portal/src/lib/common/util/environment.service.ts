import { Injector, ModuleWithProviders, NgModule } from "@angular/core";
import { InjectProperty, TypeDescriptor } from "../../reflection";

export class Environment {
    // constructor

    constructor(private environment : any) {
    }

    // public

    get<T>(key : string, defaultValue : T | undefined = undefined) : T | undefined {
        const path = key.split(".")

        let index = 0
        const length = path.length

        let object = this.environment

        while (object != null && index < length)
            object = Reflect.get(object, path[index++])

        if (index && index == length)
            return <T>object
        else {
            if (defaultValue == undefined)
                throw new Error("missing environment variable '" + key + "'")
            else
                return defaultValue
        }
    }
}

@NgModule({
    imports: [],
    providers: [],
    declarations: [],
    exports: [],
})
export class EnvironmentModule {
    static forRoot(environment : any) : ModuleWithProviders<EnvironmentModule> {
        return {
            providers: [{provide: Environment, useValue: new Environment(environment)}],
            ngModule: EnvironmentModule,
        };
    }
}

export function Value(key: string, defaultValue: any = undefined): any {
    return function (target: any, propertyKey: string) {
        TypeDescriptor.forType(target.constructor)
            .addPropertyDecorator(target, propertyKey, Value as any)
            .addInjector(new InjectProperty(propertyKey, (injector: Injector) => injector.get(Environment).get(key, defaultValue)))
    }
}
