import { Component } from '@angular/core';
import { RegisterFeature } from "@modulefederation/portal";

@RegisterFeature({
  name: ''
})
@Component({
  selector: 'second-microfront',
  template: `<div>Second MFE
    <feature-outlet feature='first-microfront.child'></feature-outlet>
  </div>`,
})
export class RemoteEntryComponent {}
