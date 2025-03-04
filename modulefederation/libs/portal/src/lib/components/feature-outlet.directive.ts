import {
    Component,
    ComponentRef,
    Directive,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
    ViewContainerRef
} from '@angular/core';
import { FeatureRegistry } from '../feature-registry';
import { FeatureData } from "../portal-manager";
import { TraceLevel, Tracer } from '@modulefederation/common';

@Component({
    selector: 'unknown-feature',
    template: '<div>Unknown Feature {{feature}}</div>'
})
export class UnknownFeatureComponent {
    feature  = ""
}

/**
 * this directive is able to render the specified feature in the surrounding container
 */
@Directive({
    selector: 'feature-outlet'
})
export class FeatureOutletDirective implements OnInit, OnChanges, OnDestroy {
    // inputs & outputs

    /**
     * the feature id
     */
    @Input() feature = ""
    @Input() input : any = {}

    // instance data

    featureData : FeatureData | undefined
    component? : ComponentRef<any> = undefined

    // constructor

    constructor(private featureRegistry : FeatureRegistry, private container : ViewContainerRef) {
    }

    // private

    ngOnChanges(changes : SimpleChanges) : void {
        if (changes['feature'] && !changes['feature'].isFirstChange() || changes['input'] && !changes['input'].isFirstChange())
            this.setFeature(this.feature)
    }

    // implement OnChanges

    ngOnInit() {
        this.setFeature(this.feature)
    }

    // implement OnInit

    ngOnDestroy() {
        this.component?.destroy();
        this.container.clear();
    }

    private setFeature(feature : string) {
        // clear previous component

        if (this.component) {
            this.component?.destroy();
            this.container.clear();
        }

        this.featureData = this.featureRegistry.findFeature(feature)

        if (this.featureData)
            this.load()

        else {
            this.component = this.container.createComponent(UnknownFeatureComponent);
            this.component.instance.feature = feature
        }
    }

    // implement OnDestroy

    private async load() {

        // local function

        const nextLoader = (feature? : FeatureData) : FeatureData | undefined => {
            while (feature) {
                if (feature.load)
                    return feature
                else
                    feature = feature.$parent
            }

            return undefined
        }

        if ( Tracer.ENABLED)
            Tracer.Trace("feature", TraceLevel.FULL, "load feature {0}", this.feature)

        let next : FeatureData | undefined
        while ((next = nextLoader(this.featureData)) != undefined) {
            if ( Tracer.ENABLED)
               Tracer.Trace("feature", TraceLevel.FULL, "lazy load {0}", next.path)

            await next.load!() // will set load to undefined in registerLazyRoutes
        }

        this.component = this.container.createComponent(this.featureData?.ngComponent);

        // set input

        for ( const key in this.input) {
            const value = this.input[key]
            this.component.setInput(key, value)
        }
    }
}
