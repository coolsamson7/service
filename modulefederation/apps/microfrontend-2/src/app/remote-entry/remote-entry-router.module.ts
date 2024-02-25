// DO NOT TOUCH THIS FILE
// GENERATED BY MICROFRONTEND GENERATOR V1.0

import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { PortalManager } from '@modulefederation/portal';

import { RemoteEntryComponent } from './remote-entry.component';

export const routes: Routes = [
  {
    path: '',
    component: RemoteEntryComponent,
    children: [],
  },

  {
    path: 'public-portal',
    loadChildren: () =>
      import('./public-portal/public-portal.module').then(
        (m) => m.PublicPortalModule
      ),
  },

  {
    path: 'private-portal',
    loadChildren: () =>
      import('./private-portal/private-portal.module').then(
        (m) => m.PrivatePortalModule
      ),
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(
      PortalManager.registerLazyRoutes('microfrontend-2', routes)
    ),
  ],

  exports: [RouterModule],
})
export class RemoteEntryRouterModule {}