import { ComponentRef, Directive, Input, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { FeatureRegistry } from '../feature-registry';

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

  component?: ComponentRef<any> = undefined

  // constructor

  constructor(private featureRegistry: FeatureRegistry, private container: ViewContainerRef) {}

  // implement OnInit

  ngOnInit() {
    this.featureRegistry.getFeatureComponent$(this.feature)
      .subscribe((component) => {
        this.component = this.container.createComponent(component);
    });
  }

  // implement OnDestroy

  ngOnDestroy() {
    this.component?.destroy();
    this.container.clear();
  }
}
