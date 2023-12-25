import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RemoteEntryComponent } from './remote-entry.component';
import { Microfrontend, PortalComponentsModule, PortalModule } from "@modulefederation/portal";
import { RemoteEntryRouterModule } from "./remote-entry-router.module";

@Microfrontend({name: 'first-microfront'})
@NgModule({
    declarations: [RemoteEntryComponent],
    imports: [CommonModule, RemoteEntryRouterModule, PortalModule, PortalComponentsModule],
    providers: [],
})
export class RemoteEntryModule {
}
