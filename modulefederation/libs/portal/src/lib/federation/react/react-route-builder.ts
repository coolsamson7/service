import { Injectable } from "@angular/core";
import { RouteBuilderManager, RouteBuilder } from "../route-builder";
import { Route } from "@angular/router";
import { Manifest } from "../../deployment";
import { ReactComponentWrapper } from "./react-wrapper";

@Injectable({
    providedIn: 'root'
  })
export class ReactRouteBuilder implements RouteBuilder {
    // constructor

    constructor(manager: RouteBuilderManager) {
        manager.register("react", this)
    }

    // implement RouteBuilder

    build(manifest: Manifest, route: Route) : void {
        route.component = ReactComponentWrapper

        route.data!["module"] = manifest.name
    }
}
