import { AbstractFeature, Feature, FeatureData, FeatureRegistry } from "@modulefederation/portal";
import { Component, OnInit } from "@angular/core";

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
export class PrivatePortalComponent extends AbstractFeature implements OnInit {
    // instance data

    features : FeatureData[] = []

    // constructor
    constructor(private featureRegistry: FeatureRegistry) {
        super();
    }

    // implement OnInit

    ngOnInit() : void {
        this.features = this.featureRegistry.finder().withTag("navigation").find()
    }
}
