import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RemoteEntryComponent } from './entry.component';
import {RegisterMicrofrontend} from "@modulefederation/portal";
import {RemoteEntryRouterModule} from "./remote-entry-router.module";


@RegisterMicrofrontend({
  name: 'second-microfront'
})
@NgModule({
  declarations: [RemoteEntryComponent],
  imports: [CommonModule, RemoteEntryRouterModule],
  providers: [],
})
export class RemoteEntryModule {}
