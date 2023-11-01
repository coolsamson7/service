import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

import { ComponentsComponent } from "./components.component";
import { ComponentListComponent } from "./component-list.component";
import { ComponentDetailsComponent } from "./component-details.component";
import { MatListModule } from "@angular/material/list";
import { RouterModule } from "@angular/router";
import { MatTabsModule } from "@angular/material/tabs";
import { NavigableListItemDirective, NavigableListComponent } from "../widgets/navigable-list.directive";
import { ServiceInstanceComponent } from "./service-instance.component";
import { ServiceInstanceListComponent } from "./service-instance-list.component";
import { ServiceAnnotationComponent, ServiceComponent, ServiceLiteralComponent, ServiceMethodComponent, ServiceTypeComponent } from "./service.component";

@NgModule({
    declarations: [
        ComponentsComponent, 
        ComponentListComponent, 
        ComponentDetailsComponent,
        NavigableListItemDirective, 
        ServiceInstanceListComponent,
        ServiceInstanceComponent,
        NavigableListComponent,
        ServiceComponent,
        ServiceLiteralComponent,
        ServiceAnnotationComponent,
        ServiceTypeComponent,
        ServiceMethodComponent
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
export class ComponentsModule { }