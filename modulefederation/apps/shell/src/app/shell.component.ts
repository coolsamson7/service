import {Component} from '@angular/core';
import { FeatureData, FeatureRegistry, SessionManager } from "@modulefederation/portal";

@Component({
    selector: 'shell',
    templateUrl: './shell.component.html',
    styleUrls: ['./shell.component.scss'],
})
export class ShellComponent {
    // instance data

    portal: FeatureData | undefined = undefined

    // private

    determinePortal() :FeatureData {
        let portals = this.featureRegistry.finder().withTag("portal").withVisibility(this.sessionManager.hasSession() ? "private" : "public").find()

        if ( portals.length == 0)
            throw new Error("there must be a feature with tag 'portal'")
        else if ( portals.length > 1)
            throw new Error("there must be exactly one feature with tag 'portal'")

        console.log("portal = " +  portals[0].path)

        return portals[0]
    }

    // constructor

    constructor(private featureRegistry: FeatureRegistry, private sessionManager: SessionManager) {
        featureRegistry.registry$.subscribe(registry =>
            this.portal = this.determinePortal()
        )

        this.portal = this.determinePortal();
    }
}
