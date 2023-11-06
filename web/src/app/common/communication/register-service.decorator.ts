import { Constructor } from "../lang/constructor.type"
import { AbstractService } from "./abstract-service"

/**
 * registers the service to relate to a specific domain.
 * @param domain the domain name
 * @constructor
 */
export function RegisterService(domain: string): any {
    return function (clazz: Constructor<AbstractService>) {
        Reflect.set(clazz, "$$domain", domain)
    }
}
