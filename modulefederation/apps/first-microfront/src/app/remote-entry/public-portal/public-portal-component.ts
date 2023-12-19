import { AbstractFeature, Feature, FeatureData, FeatureRegistry } from "@modulefederation/portal";
import { Component, OnInit } from "@angular/core";

@Feature({
    id: 'public-portal',
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

    constructor(private featureRegistry: FeatureRegistry) {
        super();
    }

    // implement OnInit

    ngOnInit() : void {
        this.features = this.featureRegistry.finder().withTag("navigation").find()
    }
}
