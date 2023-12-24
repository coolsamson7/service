import { Constructor } from "../lang/constructor.type"
import { AbstractHTTPService } from "./abstract-http-service"

export interface ServiceConfig {
    domain : string,
    prefix? : string
}

/**
 * registers the service to relate to a specific domain.
 * @param domain the domain name
 * @constructor
 */
export function Service(config : ServiceConfig) : any {
    return function(clazz : Constructor<AbstractHTTPService>) {
        Reflect.set(clazz, "$$config", config)
    }
}
