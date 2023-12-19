import {
    AbstractFeature,
    AuthenticationRequest,
    Feature,
    FeatureData,
    FeatureRegistry,
    SessionManager
} from "@modulefederation/portal";
import { Component, OnInit } from "@angular/core";

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

    constructor(private featureRegistry: FeatureRegistry, private sessionManager: SessionManager) {
        super();
    }

    // public

    login() {
        this.sessionManager.openSession({
            user: "admin",
            password: "admin"
        }).subscribe(
            (session)=> {
                console.log("ouch")
                // TODO
            },
            (error) => {
                console.log("ouch")
            })
    }

    // implement OnInit

    ngOnInit() : void {
        this.features = this.featureRegistry.finder().withTag("navigation").find()
    }
}
