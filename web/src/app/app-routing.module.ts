import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ComponentsComponent } from './components/components.component';
import { HomeComponent } from './home/home-component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ComponentDetailsComponent } from './components/component-details.component';
import { ServiceInstanceComponent } from './components/service-instance.component';
import { NodesComponent } from './nodes/nodes.component';
import { NodeDetailsComponent } from './nodes/node-details.component';

const routes: Routes = [
  { 
    path: 'home', 
    data: {
      label: "Home"
    },
    component: HomeComponent 
  },
  {
    path: 'components',
    data: {
      label: "Components"
    },
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
  },
  {
    path: 'nodes',
    data: {
      label: "Nodes"
    },
    component: NodesComponent,
    children: [
      {
        path: ':node',
        component: NodeDetailsComponent
      }
    ]
  },
  { path: '',   redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(
    routes,
    { enableTracing: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
