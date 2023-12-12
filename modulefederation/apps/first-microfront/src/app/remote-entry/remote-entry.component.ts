import { Component } from '@angular/core';
import {RegisterFeature} from "@modulefederation/portal";

@RegisterFeature({
  name: ''
})
@Component({
  selector: 'first-microfrontend',
  template: `<div>First Microfrontend</div>`,
})
export class RemoteEntryComponent {}
