import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RemoteEntryComponent } from './entry.component';
import {PortalModule, Microfrontend} from "@modulefederation/portal";
import {RemoteEntryRouterModule} from "./remote-entry-router.module";


@Microfrontend({
  name: 'second-microfront'
})
@NgModule({
  declarations: [RemoteEntryComponent],
    imports: [CommonModule, RemoteEntryRouterModule, PortalModule],
  providers: [],
})
export class RemoteEntryModule {}
