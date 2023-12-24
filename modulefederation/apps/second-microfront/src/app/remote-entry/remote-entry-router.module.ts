// DO NOT TOUCH THIS FILE
// GENERATED BY MICROFRONTEND GENERATOR V1.0

import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { PortalManager } from '@modulefederation/portal';

import { RemoteEntryComponent } from './remote-entry.component';

export const routes : Routes = [
    {
        path: '',
        component: RemoteEntryComponent,
        children: [],
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(
            PortalManager.registerLazyRoutes('second-microfront', routes)
        ),
    ],

    exports: [RouterModule],
})
export class RemoteEntryRouterModule {
}
