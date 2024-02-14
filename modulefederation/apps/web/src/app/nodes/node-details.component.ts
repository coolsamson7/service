/* eslint-disable @angular-eslint/use-lifecycle-interface */

import { Component, Injector } from "@angular/core";
import { NavigationComponent, RouteElement } from "../widgets/navigation-component.component";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { Feature } from "@modulefederation/portal";

@Component({
    selector: 'node-details',
    templateUrl: './node-details.component.html',
    styleUrls: ['./node-details.component.scss'],
    providers: []
})
@Feature({
    id: "node",
    parent: "nodes",
    router: {
        path: ":node"
    },
    label: "",
    categories: [],
    tags: [],
    permissions: []
})
export class NodeDetailsComponent extends NavigationComponent {
    // instance data

    node  = ""
    subscription? : Subscription
    routeElement : RouteElement

    // constructor

    constructor(injector: Injector, private activatedRoute : ActivatedRoute) {
        super(injector)

        this.pushRouteElement(this.routeElement = {
            label: "",
            route: "/nodes"
        })
    }

    // private

    setNode(node : string) {
        this.node = node
        this.routeElement.label = node
        this.routeElement.route += "/" + node
    }

    // implement OnInit

    override ngOnInit() : void {
        super.ngOnInit();

        this.subscription = this.activatedRoute.params.subscribe(params => {
            this.setNode(params["node"])
        })
    }
}
