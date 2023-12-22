import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComponentsComponent } from './components/components.component';
import { HomeComponent } from './home/home-component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ComponentDetailsComponent } from './components/component-details.component';
import { ServiceInstanceComponent } from './components/service-instance.component';
import { NodesComponent } from './nodes/nodes.component';
import { NodeDetailsComponent } from './nodes/node-details.component';
import { AuthGuard } from './auth/auth.guard';
import { MirofrontendsComponent } from "./portal/microfrontends.component";
import { MicrofrontendDetailsComponent } from "./portal/microfrontend-details.component";

const routes : Routes = [
  {
    path: 'home', // ok
    data: {
      label: "Home",
      icon: "home"
    },
    component: HomeComponent
  },
  {
    path: 'microfrontends',
    data: {
      label: "Microfrontends",
      icon: "folder"
    },
    component: MirofrontendsComponent,
    children: [
      {
        path: ':microfrontend',
        component: MicrofrontendDetailsComponent // ok
      }]
  },
  {
    path: 'components',
    data: {
      label: "Components",
      icon: "folder"
    },
    component: ComponentsComponent, // ok
    canActivate: [AuthGuard],
    children: [
      {
        path: ':component',
        component: ComponentDetailsComponent, // ok
        children: [
          {
            path: ':instance',
            component: ServiceInstanceComponent // ok
          }
        ]
      }
    ]
  },
  {
    path: 'nodes',
    data: {
      label: "Nodes",
      icon: "computer"
    },
    component: NodesComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: ':node',
        component: NodeDetailsComponent // ok
      }
    ]
  },
  {path: '', redirectTo: '/home', pathMatch: 'full'},
  {path: '**', component: PageNotFoundComponent}
];

import { localRoutes } from "./local.routes";

@NgModule({
  imports: [RouterModule.forRoot(
      localRoutes,// TODO CHANGed  routes,
    {enableTracing: true})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
