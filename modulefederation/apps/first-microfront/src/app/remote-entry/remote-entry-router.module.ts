// DO NOT TOUCH THIS FILE
// GENERATED BY MICROFRONTEND GENERATOR V1.0

import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { RemoteEntryComponent } from './remote-entry.component';
import {PortalConfigurationService} from "@modulefederation/portal";

export const routes: Routes = [
  {
    path: '',
    component: RemoteEntryComponent,
    children: [],
  },
  {
    path: 'child',
    loadChildren: () =>
      import('./child/child-module').then((m) => m.RemoteEntryChildModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(PortalConfigurationService.registerMicrofrontendRoutes("first-microfront", routes))],
  exports: [RouterModule],
})
export class RemoteEntryRouterModule {}
