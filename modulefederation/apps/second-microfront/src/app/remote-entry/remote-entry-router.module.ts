// DO NOT TOUCH THIS FILE
// GENERATED BY MICROFRONTEND GENERATOR V1.0

import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { RemoteEntryComponent } from './entry.component';
import {PortalConfigurationService} from "@modulefederation/portal";

export const routes: Routes = [
  {
    path: '',
    component: RemoteEntryComponent,
    children: [],
  },
];

class Bla {
  static register(mfe: string, routes: Routes) {
    return PortalConfigurationService.registerMicrofrontendRoutes(mfe, routes)
  }
}
@NgModule({
  imports: [RouterModule.forChild(Bla.register("second-microfront", routes))],
  exports: [RouterModule],
})
export class RemoteEntryRouterModule extends Bla  {}
