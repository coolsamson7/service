import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RemoteEntryComponent } from './entry.component';
import {RegisterModule} from "@modulefederation/portal";
import {RemoteEntryRouterModule} from "./remote-entry-router-module.module";


@RegisterModule({
  name: 'second-microfrontend'
})
@NgModule({
  declarations: [RemoteEntryComponent],
  imports: [CommonModule, RemoteEntryRouterModule],
  providers: [],
})
export class RemoteEntryModule {}
