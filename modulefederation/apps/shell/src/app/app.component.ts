import {Component} from '@angular/core';
import { FeatureData, FeatureRegistry } from "@modulefederation/portal";

@Component({
    selector: 'modulefederation-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    // instance data

    portal: FeatureData

    // constructor

    constructor(private featureRegistry: FeatureRegistry) {
        let portals = featureRegistry.finder().withTag("portal").find()

        if ( portals.length == 0)
            throw new Error("there must be a feature with tag 'portal'")
        else if ( portals.length > 1)
            throw new Error("there must be exactly one feature with tag 'portal'")

        this.portal = portals[0]
    }
}
