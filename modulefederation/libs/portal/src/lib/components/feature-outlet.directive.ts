import {ComponentRef, Directive, Input, OnChanges, OnDestroy, OnInit, SimpleChanges,
  ViewContainerRef
} from '@angular/core';
import { FeatureRegistry } from '../feature-registry';
import { FeatureData } from "../portal-manager";

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
  @Input() feature : string = ""

  // instance data

  featureData : FeatureData | undefined
  component? : ComponentRef<any> = undefined

  // constructor

  constructor(private featureRegistry : FeatureRegistry, private container : ViewContainerRef) {
    console.log("new feature-outlet ")
  }

  // private

  private setFeature(feature: string) {
    console.log("load feature-outlet feature " + feature)

    this.featureData = this.featureRegistry.getFeature(feature)

    this.load()
  }

  // implement OnChanges

  ngOnChanges(changes: SimpleChanges): void {
    if ( changes['feature'] && changes['feature'].currentValue !==  this.feature)
      this.setFeature(this.feature)
  }

    // implement OnInit

    ngOnInit() {
      this.setFeature(this.feature)
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
