import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

import { MatListModule } from "@angular/material/list";
import { RouterModule } from "@angular/router";
import { MatTabsModule } from "@angular/material/tabs";
import { NodeDetailsComponent } from "./node-details.component";
import { NodesComponent } from "./nodes.component";
import { NavigationBreadcrumbComponent } from "./navigation-breadcrumb.component";

@NgModule({
    declarations: [
        NodesComponent, 
        NodeDetailsComponent,
        NavigationBreadcrumbComponent
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
export class NodesModule { }