import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RemoteEntryComponent } from './remote-entry.component';
import {PortalModule, RegisterMicrofrontend} from "@modulefederation/portal";
import {RemoteEntryRouterModule} from "./remote-entry-router.module";

@RegisterMicrofrontend({name: 'first-microfront'})
@NgModule({
  declarations: [RemoteEntryComponent],
  imports: [CommonModule, RemoteEntryRouterModule, PortalModule],
  providers: [],
})
export class RemoteEntryModule {}
