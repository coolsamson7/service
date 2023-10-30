import { Component, OnInit } from "@angular/core";
import { ComponentService } from "../service/component-service.service";
import { ActivatedRoute } from "@angular/router";



export interface RouteElement {
   label: String
   route: string
}

@Component({
    selector: 'components',
    templateUrl: './components.component.html',
    styleUrls: ['./components.component.css']
  })
  export class ComponentsComponent implements OnInit {
    // instance data

    public routes: RouteElement[] = [{
      label: "All",
      route: "/components"
    }]

    // constructor

    constructor(private activatedRoute: ActivatedRoute) {
      //console.log("Kk")
    }

    // implement OnInit

    ngOnInit(): void {
    }
  }