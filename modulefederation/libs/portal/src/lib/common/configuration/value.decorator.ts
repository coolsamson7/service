import { Injector } from "@angular/core"
import { InjectProperty, TypeDescriptor } from "../../reflection"
import { ConfigurationManager } from "./configuration-manager"

export function Value(key: string, defaultValue: any = undefined): any {
    return function (target: any, propertyKey: string) {
        TypeDescriptor.forType(target.constructor)
            .addPropertyDecorator(target, propertyKey, Value as any)
            .addInjector(new InjectProperty(propertyKey, (injector: Injector) => injector.get(ConfigurationManager).get(key, defaultValue)))
    }
}
