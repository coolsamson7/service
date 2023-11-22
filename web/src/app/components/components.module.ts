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
import { JSONComponent, QueryParamComponent, ServiceAnnotationComponent, ServiceClassComponent, ServiceComponent, ServiceLiteralComponent, ServiceMethodComponent, ServiceMethodRunnerComponent, ServicePropertyComponent, ServiceTypeComponent } from "./service.component";
import { FormsModule } from "@angular/forms";
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

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
        ServiceMethodComponent,
        ServicePropertyComponent,
        ServiceClassComponent,
        ServiceMethodRunnerComponent,
        QueryParamComponent,
        JSONComponent
    ],
    imports: [
      CommonModule,
      RouterModule,
      MatListModule,
      MatTabsModule,
      MatInputModule,
      MatFormFieldModule,
      MatIconModule,
      FormsModule,
      MonacoEditorModule.forRoot() // use forRoot() in main app module only.
    ]
  })
export class ComponentsModule { }