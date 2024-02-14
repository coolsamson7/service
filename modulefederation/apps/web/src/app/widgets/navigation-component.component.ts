import { Component, Injector, OnInit } from "@angular/core";
import { AbstractFeature } from "@modulefederation/portal";

export interface RouteElement {
    label : string
    route : string
}

@Component({
    selector: 'navigation-component',
    template: '<div></div>',
    // styleUrls: ['./navigation-breadcrumb.component.scss'],
})
export class NavigationComponent extends AbstractFeature {
    // instance data

    public routes : RouteElement[] = []

    // constructor

    constructor(injector: Injector) {
        super(injector)
    }

    // public

    topRouteElement() : RouteElement {
        return this.routes[this.routes.length - 1];
    }

    pushRouteElement(route : RouteElement) {
        this.routes.push(route);
    }

    popRouteElement(route : RouteElement) {
        this.routes.splice(this.routes.indexOf(route, 0), 1);
    }
}
