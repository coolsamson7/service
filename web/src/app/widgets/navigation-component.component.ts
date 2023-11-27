
import { Component, OnInit } from "@angular/core";

export interface RouteElement {
   label: String
   route: string
}

@Component({
    selector: 'navigation-component',
    template: '<div></div>',
   // styleUrls: ['./navigation-breadcrumb.component.scss'],
  })
export class NavigationComponent implements OnInit {
    // instance data

    public routes: RouteElement[] = []

    // constructor

    constructor() {
    }

    // public

    topRouteElement() : RouteElement {
      return this.routes[this.routes.length - 1];
    }

    pushRouteElement(route: RouteElement) {
      this.routes.push(route);
    }

    popRouteElement(route : RouteElement) {
      this.routes.splice(this.routes.indexOf(route, 0), 1);
    }

    // implement OnInit

    ngOnInit(): void {
    }
  }