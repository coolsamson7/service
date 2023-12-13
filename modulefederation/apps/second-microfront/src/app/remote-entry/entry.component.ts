import { Component } from '@angular/core';
import { Feature } from "@modulefederation/portal";

@Feature({
  id: '',
  label: "Microfrontend 2",
  tags: ["navigation"],
  visibility: ["public", "private"]
})
@Component({
  selector: 'second-microfront',
  template: `<div>Second MFE
    <feature-outlet feature='first-microfront.child'></feature-outlet>
  </div>`,
})
export class RemoteEntryComponent {}
