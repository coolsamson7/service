import { Component, Injector } from '@angular/core';
import { AbstractFeature, Feature } from "@modulefederation/portal";

@Feature({
    id: 'home',
    isDefault: true
})
@Component({
    standalone: true,
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent extends AbstractFeature {
    // constructor

    constructor(injector: Injector) {
        super(injector);
    }
}
