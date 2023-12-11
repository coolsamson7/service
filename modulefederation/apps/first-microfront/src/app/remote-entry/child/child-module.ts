import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {PortalModule} from "@modulefederation/portal";
import {RemoteEntryChildComponent} from "./child-component";
import {RemoteEntryChildRouterModule} from "./remote-entry-child-router.module";

@NgModule({
  declarations: [RemoteEntryChildComponent],
  imports: [CommonModule, PortalModule, RemoteEntryChildRouterModule],
  providers: [],
})
export class RemoteEntryChildModule {}
