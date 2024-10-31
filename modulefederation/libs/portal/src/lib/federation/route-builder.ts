import { Injectable } from "@angular/core";
import { Route } from "@angular/router";
import { Manifest } from "../deployment";
import { WebComponentRouteBuilder } from "./web-component";
import { AngularRouteBuilder } from "./angular";
import { ReactRouteBuilder } from "./react";

export interface RouteBuilder {
    build(manifest: Manifest, route: Route) : void
}


@Injectable({
    providedIn: 'root'
  })
export class RouteBuilderManager {
    // instance data


    private builder: { [type: string]: RouteBuilder } = {}

    constructor() {
        new AngularRouteBuilder(this)
        new WebComponentRouteBuilder(this)
        new ReactRouteBuilder(this)
    }

    // public

    build(manifest: Manifest, route: Route) : void {
        let stack = manifest.stack || "angular"
        const colon = stack.indexOf(":")
        if ( colon > 0)
            stack = stack.substring(0, colon)

        this.find(stack).build(manifest, route)
    }

    register(type: string, builder: RouteBuilder) {
        this.builder[type] = builder
    }

    // private

    find(type: string) : RouteBuilder{
        return this.builder[type]
    }
}
