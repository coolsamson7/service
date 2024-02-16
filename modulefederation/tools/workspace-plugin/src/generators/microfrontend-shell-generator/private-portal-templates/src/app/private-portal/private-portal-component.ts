/* eslint-disable @angular-eslint/component-selector */
/* eslint-disable @angular-eslint/use-lifecycle-interface */
import {
    AboutDialogService,
    AbstractFeature,
    Feature,
    FeatureData,
    FeatureRegistry,
    PortalManager,
    SessionManager,
    Ticket
} from "@modulefederation/portal";
import { Component, Injector, OnInit } from "@angular/core";
import { Router } from "@angular/router";

@Feature({
    id: 'private-portal',
    visibility: ["private"],
    tags: ["portal"],
    router: {
        lazyModule: "PrivatePortalModule"
    }
})
@Component({
    selector: 'private-portal',
    templateUrl: './private-portal-component.html',
    styleUrls: ["./private-portal-component.scss"]
})
export class PrivatePortalComponent extends AbstractFeature {
    // instance data

    features : FeatureData[] = []

    // constructor

    constructor(injector: Injector, private portalManager : PortalManager, private router : Router, private sessionManager : SessionManager<any, Ticket>, private featureRegistry : FeatureRegistry, private aboutDialogService : AboutDialogService) {
        super(injector);

        featureRegistry.registry$.subscribe(_ => this.computeNavigation())
    }

    // callbacks

    about() {
        this.aboutDialogService.show()
    }

    logout() {
        this.sessionManager.closeSession().subscribe(
            (session) => {
                this.portalManager.loadDeployment(true).then(result =>
                    this.router.navigate(["/"])
                )
            },
            (error) => {
                console.log(error)
            })
    }

    // private

    private computeNavigation() {
        this.features = this.featureRegistry.finder().withEnabled().withTag("navigation").find()
    }

    // override OnInit

    override ngOnInit() : void {
      super.ngOnInit()

      this.computeNavigation()
    }
}
