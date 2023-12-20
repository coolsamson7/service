import { Component } from '@angular/core';
import { Feature } from "@modulefederation/portal";

@Feature({
  id: '',
  label: "Microfrontend 1",
  tags: ["navigation"],
  visibility: ["public", "private"]
})
@Component({
  selector: 'first-microfrontend',
  template: `<div>First Microfrontend</div>`,
})
export class RemoteEntryComponent {
}
