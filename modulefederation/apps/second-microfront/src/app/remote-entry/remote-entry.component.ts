/* eslint-disable @angular-eslint/component-selector */
import { Component } from '@angular/core';
import { AbstractFeature, Feature } from "@modulefederation/portal";

@Feature({
    id: '',
    label: "Microfrontend 2",
    tags: ["navigation"],
    visibility: ["private"]
})
@Component({
    selector: 'second-microfront',
    template: `<div>Second MF</div>`,
})
export class RemoteEntryComponent extends AbstractFeature {
}
