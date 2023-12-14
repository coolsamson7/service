// DO NOT TOUCH THIS FILE
// GENERATED BY MICROFRONTEND GENERATOR V1.0

import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {PortalManager} from '@modulefederation/portal';

import {RemoteEntryComponent} from './remote-entry.component';

export const routes : Routes = [
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
    imports: [
        RouterModule.forChild(
            PortalManager.registerLazyRoutes('first-microfront', routes)
        ),
    ],

    exports: [RouterModule],
})
export class RemoteEntryRouterModule {
}
