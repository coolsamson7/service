/* eslint-disable @angular-eslint/component-selector */
import { Component } from '@angular/core';
import { AbstractFeature, Feature } from "@modulefederation/portal";

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
export class RemoteEntryComponent extends AbstractFeature {
}
