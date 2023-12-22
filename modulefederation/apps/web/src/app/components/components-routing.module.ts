import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ComponentDetailsComponent } from "./component-details.component";
import { ComponentsComponent } from "./components.component";
import { ServiceInstanceComponent } from "./service-instance.component";

const routes : Routes = [
  {
    path: 'components',
    component: ComponentsComponent,
    children: [
      {
        path: ':component',
        component: ComponentDetailsComponent,
        children: [
          {
            path: ':instance',
            component: ServiceInstanceComponent
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComponentsRoutingModule {
}
