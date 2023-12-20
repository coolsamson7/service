import {
  Component, ComponentRef, Directive, Input, OnChanges, OnDestroy, OnInit, SimpleChanges,
  ViewContainerRef
} from '@angular/core';
import { FeatureRegistry } from '../feature-registry';
import { FeatureData } from "../portal-manager";

@Component({
  selector: 'unknown-feature',
  template: '<div>Unknown Feature {{feature}}</div>'
})
export class UnknownFeatureComponent {
  feature: string = ""
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
  @Input() feature : string = ""

  // instance data

  featureData : FeatureData | undefined
  component? : ComponentRef<any> = undefined

  // constructor

  constructor(private featureRegistry : FeatureRegistry, private container : ViewContainerRef) {
  }

  // private

  private setFeature(feature: string) {
    // clear previous component

    if ( this.component) {
      this.component?.destroy();
      this.container.clear();
    }

    this.featureData = this.featureRegistry.findFeature(feature)

    if ( this.featureData)
      this.load()
    else {
      this.component = this.container.createComponent(UnknownFeatureComponent);
      this.component.instance.feature = feature
    }
  }

  // implement OnChanges

  ngOnChanges(changes: SimpleChanges): void {
    if ( changes['feature'] && !changes['feature'].isFirstChange())
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
