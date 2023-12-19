import {Component} from '@angular/core';
import { FeatureData, FeatureRegistry } from "@modulefederation/portal";

@Component({
    selector: 'modulefederation-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    title = 'shell';
    // instance data

    portal: FeatureData

    // constructor

    constructor(private featureRegistry: FeatureRegistry) {
        let portals = featureRegistry.finder().withTag("portal").find()

        this.portal = portals[0]
    }

    // public

    path(feature: FeatureData):string {
        return feature.path!!.replace("/", ".") // ???
    }
}
