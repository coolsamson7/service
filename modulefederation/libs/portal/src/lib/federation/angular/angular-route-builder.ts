import { Injectable } from "@angular/core";
import { RouteBuilderManager, RouteBuilder } from "../route-builder";
import { Route } from "@angular/router";
import { Manifest } from "../../deployment";
import { loadRemoteModule } from "@nx/angular/mf";

@Injectable({
    providedIn: 'root'
  })
export class AngularRouteBuilder implements RouteBuilder {
    // constructor

    constructor(manager: RouteBuilderManager) {
        manager.register("angular", this)
    }

    // implement RouteBuilder

    build(module: Manifest, route: Route) : void {
        // simply load the remote module
      
        route.loadChildren = () => loadRemoteModule(module.name, './Module')
                .then(m => m[module.module])
                .catch(e => {
                    console.log(e)
                    throw e
                })
        }
}
