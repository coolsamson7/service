import { Component } from "@angular/core";
import { NavigationComponent } from "../widgets/navigation-component.component";

@Component({
    selector: 'components',
    templateUrl: './components.component.html',
    styleUrls: ['./components.component.scss'],
    providers: []
  })
  export class ComponentsComponent extends NavigationComponent {
    // constructor

    constructor() {
      super()

      this.pushRouteElement({
        label: "Components",
        route: "/components"
      })
    }
  }