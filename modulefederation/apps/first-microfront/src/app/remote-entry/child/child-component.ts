import {AbstractFeature, Feature} from "@modulefederation/portal";
import {Component} from "@angular/core";

@Feature({
  id: 'child',
  router: {
    lazyModule: "RemoteEntryChildModule"
  }
})
@Component({
  selector: 'first-microfrontend-child',
  template: `<div>First Microfrontend Child</div>`,
})
export class RemoteEntryChildComponent extends AbstractFeature {
  constructor() {
    super();
  }
}
