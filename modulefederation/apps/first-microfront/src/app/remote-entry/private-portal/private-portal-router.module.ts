// DO NOT TOUCH THIS FILE
// GENERATED BY MICROFRONTEND GENERATOR V1.0

import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { PortalManager } from '@modulefederation/portal';

import { PrivatePortalComponent } from './private-portal-component';

export const routes : Routes = [
    {
        path: '',
        component: PrivatePortalComponent,
        children: [],
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(
            PortalManager.registerLazyRoutes(
                'first-microfront.private-portal',
                routes
            )
        ),
    ],

    exports: [RouterModule],
})
export class PrivatePortalRouterModule {
}
