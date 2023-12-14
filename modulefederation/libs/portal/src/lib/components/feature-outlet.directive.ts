import {ComponentRef, Directive, Input, OnDestroy, OnInit, ViewContainerRef} from '@angular/core';
import {FeatureRegistry} from '../feature-registry';
import {FeatureData} from "../portal-manager";

/**
 * this directive is able to render the specified feature in the surrounding container
 */
@Directive({
    selector: 'feature-outlet'
})
export class FeatureOutletDirective implements OnInit, OnDestroy {
    // inputs & outputs

    /**
     * the feature id
     */
    @Input() feature : string = ""

    // instance data

    featureData : FeatureData | undefined
    component? : ComponentRef<any> = undefined

    // constructor

    constructor(private featureRegistry : FeatureRegistry, private container : ViewContainerRef) {
    }

    // implement OnInit

    ngOnInit() {
        this.featureData = this.featureRegistry.getFeature(this.feature)

        this.load()
    }

    ngOnDestroy() {
        this.component?.destroy();
        this.container.clear();
    }

    // implement OnDestroy

    private async load() {
        // local function
        let nextLoader = (feature? : FeatureData) : FeatureData | undefined => {
            while (feature) {
                if (feature.load)
                    return feature
                else
                    feature = feature.$parent
            }

            return undefined
        }

        let next : FeatureData | undefined
        while ((next = nextLoader(this.featureData)) != undefined)
            await next.load!!() // will set load to undefined in registerLazyRoutes

        this.component = this.container.createComponent(this.featureData?.ngComponent);
    }
}
