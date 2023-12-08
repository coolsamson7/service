import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RemoteEntryComponent } from './entry.component';
import { RegisterModule } from "@modulefederation/portal";
import {RemoteEntryRouterModule} from "./remote-entry-router-module.module";

@RegisterModule({name: 'first-microfront'})
@NgModule({
  declarations: [RemoteEntryComponent],
  imports: [CommonModule, RemoteEntryRouterModule],
  providers: [],
})
export class RemoteEntryModule {}
