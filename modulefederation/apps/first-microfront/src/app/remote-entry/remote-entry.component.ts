import { Component } from '@angular/core';
import {RegisterFeature} from "@modulefederation/portal";

@RegisterFeature({
  name: ''
})
@Component({
  selector: 'first-microfrontend',
  template: `<div>First Microfrontend
    <feature-outlet feature='child'></feature-outlet>
  </div>`,
})
export class RemoteEntryComponent {}
