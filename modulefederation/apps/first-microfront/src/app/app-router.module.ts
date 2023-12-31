// DO NOT TOUCH THIS FILE
// GENERATED BY MICROFRONTEND GENERATOR V1.0

import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { PortalManager } from '@modulefederation/portal';

export const routes : Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./remote-entry/remote-entry.module').then(
        (m) => m.RemoteEntryModule
      ),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot( routes)
  ],

  exports: [RouterModule],
})
export class AppRouterModule {
}
