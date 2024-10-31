import { Injectable } from "@angular/core";
import { RouteBuilderManager, RouteBuilder } from "../route-builder";
import { Route } from "@angular/router";
import { Manifest } from "../../deployment";
import { WebComponentWrapper } from "./web-component-wrapper";

@Injectable({
    providedIn: 'root'
  })
export class WebComponentRouteBuilder implements RouteBuilder {
    // constructor

    constructor(manager: RouteBuilderManager) {
        manager.register("web-component", this)
    }

    // implement RouteBuilder

    build(manifest: Manifest, route: Route) : void {
       route.component = WebComponentWrapper

       const colon = manifest.stack!.indexOf(":")
       const elementName = manifest.stack?.substring(colon + 1)

       // remember data

       route.data!["module"] = manifest.name
       route.data!["elementName"] = elementName
    }
}
