import { ComponentRef, Directive, Input, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { FeatureRegistry } from '../feature-registry';
import {FeatureConfig} from "../feature-config";
import {LoadChildrenCallback} from "@angular/router";

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
  @Input() feature: string = ""

  // instance data

  featureConfig: FeatureConfig | undefined
  component?: ComponentRef<any> = undefined

  // constructor

  constructor(private featureRegistry: FeatureRegistry, private container: ViewContainerRef) {}

  // implement OnInit

  ngOnInit() {
    this.featureConfig = this.featureRegistry.getFeature(this.feature)

    this.load()
  }

  private async load() {
    // local function
    let nextLoader = (feature?: FeatureConfig) : FeatureConfig | undefined => {
      while ( feature) {
        if ( feature.load )
          return feature
        else
          feature = feature.$parent
      }

      return undefined
    }

    let next : FeatureConfig | undefined
    while ((next = nextLoader(this.featureConfig)) != undefined)
      await next.load!!() // will set load to undefined in registerLazyRoutes

    this.component = this.container.createComponent(this.featureConfig?.ngComponent);
  }

  // implement OnDestroy

  ngOnDestroy() {
    this.component?.destroy();
    this.container.clear();
  }
}
