import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

import { ComponentsComponent } from "./components.component";
import { ComponentListComponent } from "./component-list.component";
import { ComponentDetailsComponent } from "./component-details.component";
import { MatListModule } from "@angular/material/list";
import { RouterModule } from "@angular/router";
import { MatTabsModule } from "@angular/material/tabs";
import { NavigableListItemDirective, NavigableListComponent } from "../widgets/navigable-list.directive";

@NgModule({
    declarations: [
        ComponentsComponent, 
        ComponentListComponent, 
        ComponentDetailsComponent,
        NavigableListItemDirective, 
        NavigableListComponent
    ],
    imports: [
      CommonModule,
      RouterModule,
      MatListModule,
      MatTabsModule,
      MatInputModule,
      MatFormFieldModule
    ]
  })
export class ComponentsModule { }