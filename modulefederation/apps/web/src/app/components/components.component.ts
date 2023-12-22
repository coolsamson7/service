import { Component } from "@angular/core";
import { NavigationComponent } from "../widgets/navigation-component.component";
import { Feature } from "@modulefederation/portal";

@Component({
  selector: 'components',
  templateUrl: './components.component.html',
  styleUrls: ['./components.component.scss'],
  providers: []
})
@Feature({
  id: "components",
  label: "Components",
  icon: "folder",
  visibility: ["public", "private"],
  categories: [],
  tags: [],
  permissions: []
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
