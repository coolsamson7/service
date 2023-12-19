import {Component} from '@angular/core';
import { FeatureData, FeatureRegistry, SessionManager } from "@modulefederation/portal";

@Component({
    selector: 'shell',
    templateUrl: './shell.component.html',
    styleUrls: ['./shell.component.scss'],
})
export class ShellComponent {
    // instance data

    portal: FeatureData

    // constructor

    constructor(private featureRegistry: FeatureRegistry, private sessionManager: SessionManager) {
        let portals :FeatureData[]

        if (sessionManager.hasSession())
            portals = featureRegistry.finder().withTag("portal").withVisibility("private").find()
        else
            portals = featureRegistry.finder().withTag("portal").withVisibility("public").find()

        if ( portals.length == 0)
            throw new Error("there must be a feature with tag 'portal'")
        else if ( portals.length > 1)
            throw new Error("there must be exactly one feature with tag 'portal'")

        this.portal = portals[0]
    }
}
