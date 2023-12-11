import {RegisterFeature} from "@modulefederation/portal";
import {Component} from "@angular/core";

@RegisterFeature({
  name: 'child',
  router: {
    lazyModule: "RemoteEntryChildModule"
  }
})
@Component({
  selector: 'first-microfrontend-child',
  template: `<div>First Microfrontend Child</div>`,
})
export class RemoteEntryChildComponent {}
