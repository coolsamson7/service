import { Component, Injectable, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs";
import { ComponentDTO } from "../model/component.interface";
import { ComponentService } from "../service/component-service.service";

export interface RouteElement {
   label: String
   route: string
}


@Component({
    selector: 'components',
    templateUrl: './components.component.html',
    styleUrls: ['./components.component.scss'],
    providers: []
  })
  export class ComponentsComponent implements OnInit {
    // instance data

    public routes: RouteElement[] = []

    // constructor

    constructor(private activatedRoute: ActivatedRoute) {
      this.pushRouteElement({
        label: "Components",
        route: "/components"
      })
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