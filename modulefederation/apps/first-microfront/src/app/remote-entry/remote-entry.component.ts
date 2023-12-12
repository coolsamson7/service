import { Component } from '@angular/core';
import {RegisterFeature} from "@modulefederation/portal";

@RegisterFeature({
  name: '',
  label: "Microfrontend 1",
  tags: ["navigation"],
  visibility: ["public", "private"]
})
@Component({
  selector: 'first-microfrontend',
  template: `<div>First Microfrontend</div>`,
})
export class RemoteEntryComponent {}
