import { Component, Input } from "@angular/core";
import { RouteElement } from "../widgets/navigation-component.component";

@Component({
    selector: 'navigation-breadcrumb',
    templateUrl: './navigation-breadcrumb.component.html',
    styleUrls: ['./navigation-breadcrumb.component.scss'],
    providers: []
})
export class NavigationBreadcrumbComponent {
    // input

    @Input('routes') routes! : RouteElement[]

    // constructor
    constructor() {

    }
}
