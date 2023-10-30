import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ComponentDetailsComponent } from "./component-details.component";
import { ComponentsComponent } from "./components.component";

const routes: Routes = [
    {
      path: 'components',
      component: ComponentsComponent,
      children: [
            {
              path: ':component',
              component: ComponentDetailsComponent
            }
          ]
    }
  ];
  
  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class ComponentsRoutingModule { }