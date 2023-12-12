import { Component } from '@angular/core';
import { RegisterFeature } from "@modulefederation/portal";

@RegisterFeature({
  name: ''
})
@Component({
  selector: 'second-microfront',
  template: `<div>Second MFE</div>`,
})
export class RemoteEntryComponent {}
