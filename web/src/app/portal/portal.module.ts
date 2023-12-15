import { NgModule } from "@angular/core";
import { NodesComponent } from "../nodes/nodes.component";
import { NodeDetailsComponent } from "../nodes/node-details.component";
import { NavigationBreadcrumbComponent } from "../nodes/navigation-breadcrumb.component";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { MatListModule } from "@angular/material/list";
import { MatTabsModule } from "@angular/material/tabs";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MirofrontendsComponent } from "./microfrontends.component";

@NgModule({
  declarations: [
    MirofrontendsComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatTabsModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule
  ]
})
export class PortalModule { }
