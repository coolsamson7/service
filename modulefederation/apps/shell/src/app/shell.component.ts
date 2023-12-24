import { Component } from '@angular/core';
import { FeatureData, FeatureRegistry, SessionManager, Ticket } from "@modulefederation/portal";

@Component({
    selector: 'shell',
    templateUrl: './shell.component.html',
    styleUrls: ['./shell.component.scss'],
})
export class ShellComponent {
    // instance data

    portal : FeatureData | undefined = undefined

    // private

    constructor(private featureRegistry : FeatureRegistry, private sessionManager : SessionManager<any, Ticket>) {
        featureRegistry.registry$.subscribe(registry =>
            this.portal = this.determinePortal()
        )

        this.portal = this.determinePortal();
    }

    // constructor

    determinePortal() : FeatureData {
        let portals = this.featureRegistry.finder().withTag("portal").withVisibility(this.sessionManager.hasSession() ? "private" : "public").find()

        if (portals.length == 0)
            throw new Error("there must be a feature with tag 'portal'")
        else if (portals.length > 1)
            throw new Error("there must be exactly one feature with tag 'portal'")

        return portals[0]
    }
}
