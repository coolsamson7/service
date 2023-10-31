
import { Component } from "@angular/core";
import { NavigationComponent } from "../widgets/navigation-component.component";
import { ComponentService } from "../service/component-service.service";
import { NavigationBreadcrumbComponent } from "./navigation-breadcrumb.component";

@Component({
    selector: 'nodes',
    templateUrl: './nodes.component.html',
    styleUrls: ['./nodes.component.scss'],
    providers: []
  })
  export class NodesComponent extends NavigationComponent {
    // instance data

    nodes: String[] = []
    selected: string

    // constructor

    constructor(private componentService: ComponentService) {
        super()
    
        this.pushRouteElement({
            label: "Nodes",
            route: "/nodes"
        })
    }

    // implement OnInit

    ngOnInit(): void {
        super.ngOnInit();

        this.componentService.getNodes().subscribe( {
            next: (response) => { this.nodes = response; }
           });
    }
  }