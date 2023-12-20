import { Component } from "@angular/core";
import { NavigationComponent, RouteElement } from "../widgets/navigation-component.component";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";

@Component({
  selector: 'node-details',
  templateUrl: './node-details.component.html',
  styleUrls: ['./node-details.component.scss'],
  providers: []
})
export class NodeDetailsComponent extends NavigationComponent {
  // instance data

  node : String
  subscription : Subscription
  routeElement : RouteElement

  // constructor

  constructor(private activatedRoute : ActivatedRoute) {
    super()

    this.pushRouteElement(this.routeElement = {
      label: "",
      route: "/nodes"
    })
  }

  // private

  setNode(node : String) {
    this.node = node
    this.routeElement.label = node
    this.routeElement.route += "/" + node
  }

  // implement OnInit

  ngOnInit() : void {
    super.ngOnInit();

    this.subscription = this.activatedRoute.params.subscribe(params => {
      this.setNode(params["node"])
    })
  }
}
