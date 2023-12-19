import {
    AbstractFeature,
    Feature,
    FeatureData,
    FeatureRegistry, PortalManager,
    SessionManager
} from "@modulefederation/portal";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

@Feature({
    id: 'public-portal',
    visibility: ["public"],
    tags: ["portal"],
    router: {
        lazyModule: "PublicPortalModule"
    }
})
@Component({
    selector: 'public-portal',
    templateUrl: './public-portal-component.html',
    styleUrls: ["./public-portal-component.scss"]
})
export class PublicPortalComponent extends AbstractFeature implements OnInit {
    // instance data

    features : FeatureData[] = []

    // constructor

    constructor(private router: Router, private featureRegistry: FeatureRegistry, private sessionManager: SessionManager, private portalManager: PortalManager) {
        super();

        featureRegistry.registry$.subscribe(_=>this.computeNavigation())
    }

    // private

  private computeNavigation() {
    this.features = this.featureRegistry.finder().withEnabled().withTag("navigation").find()
  }

    // public

    login() {
        this.sessionManager.openSession({
            user: "admin",
            password: "admin"
        }).subscribe(
            (session)=> {
                this.portalManager.loadDeployment(true).then(result =>
                    this.router.navigate([this.router.url]) // TODO
                )
            },
            (error) => {
                console.log("ouch")
            })
    }

    // implement OnInit

    ngOnInit() : void {
        this.computeNavigation()
    }
}
