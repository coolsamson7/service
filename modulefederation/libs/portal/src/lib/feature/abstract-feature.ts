import {
  AfterContentInit,
  AfterViewInit,
  Component,
  InjectFlags,
  InjectOptions,
  Injector,
  OnDestroy,
  OnInit,
  ProviderToken,
  Type
} from '@angular/core';
import { TraceLevel, Tracer } from '@modulefederation/common';
import { FeatureManager } from './feature-manager';
import { FeatureConfig } from '../feature-config';
import { TypeDescriptor } from '../common';

/**
 * a <code>LifecycleAware</code> can include functions that will be executed in the different phases of a component.
 */
export interface LifecycleAware {
  /**
   * executed in the ngOnInit method
   */
  onInit?: () => void;
  /**
   * executed in the ngOnDestroy method
   */
  onDestroy?: () => void;

  /**
   * executed in the ngAfterViewInit method
   */
  afterViewInit?: () => void;

  /**
   * executed in the ngAfterContentInit method
   */
  afterContentInit?: () => void;
}


/**
 * covers the possible phases
 * @see LifecycleAware
 */
declare type LifecyclePhase = 'onInit' | 'onDestroy' | 'afterContentInit' | 'afterViewInit';

@Component({
  selector: 'abstract-lifecycle',
  template: ''
})
export class WithLifecycle implements OnInit, AfterViewInit, AfterContentInit, OnDestroy {
  // instance data

  private lifecycleAware: LifecycleAware[] = [];

   // protected

  /**
   * executes the specified function in the init phase
   * @param func a function
   * @protected
   */
  protected onInit(func: () => void) {
    this.pushLifecycle({
      onInit: func
    });
  }

  /**
   * executes the specified function in the after view init phase
   * @param func a function
   * @protected
   */
  protected afterViewInit(func: () => void) {
    this.pushLifecycle({
      afterViewInit: func
    });
  }

  /**
   * executes the specified function in the after content init phase
   * @param func a function
   * @protected
   */
  protected afterContentInit(func: () => void) {
    this.pushLifecycle({
      afterContentInit: func
    });
  }

  /**
   * executes the specified function in the destroy phase
   * @param func a function
   * @protected
   */
  protected onDestroy(func: () => void) {
    this.pushLifecycle({
      onDestroy: func
    });
  }

  /**
   * add a lifecycle object for a specific phase
   * @param lifecycle the lifecycle method
   * @protected
   * @see LifecycleAware
   */
  protected pushLifecycle(lifecycle: LifecycleAware) {
    this.lifecycleAware.push(lifecycle);
  }

  /**
   * run the appropriate methods in a specific phase ( onDestroy, onInit ) and remove if applicable
   * @param phase one of 'onDestroy', 'onInit'
   * @protected
   */
  protected executeLifecycle(phase: LifecyclePhase) {
    // execute in reverse so that the splice doesn't break us

    for (let i = this.lifecycleAware.length - 1; i >= 0; i--) {
      const lifecycleAware = this.lifecycleAware[i];

      if (lifecycleAware[phase]) {
        lifecycleAware[phase]?.();

        this.lifecycleAware.splice(i, 1); // and delete
      }
    }
  }

  // implement OnInit

  /**
   * @inheritdoc
   */
  ngOnInit(): void {
    this.executeLifecycle('onInit');
  }

  // implement  AfterContentInit

  /**
   * @inheritdoc
   */
  ngAfterContentInit(): void {
    this.executeLifecycle('afterContentInit');
  }

  // implement AfterViewInit

  /**
   * @inheritdoc
   */
  ngAfterViewInit(): void {
    this.executeLifecycle('afterViewInit');
  }

  // OnDestroy

  /**
   * @inheritdoc
   */
  ngOnDestroy(): void {
    this.executeLifecycle('onDestroy');

    // unlink at the very end...

    //this.unlinkParent();
  }
}

@Component({
  selector: 'abstract-feature',
  template: ''
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class AbstractFeature extends WithLifecycle {
  // instance data

  parent?: AbstractFeature;
  children: AbstractFeature[] = [];

  // constructor

  /**
   * create a new AbstractFeature.
   * @param injector the appropriate injector that will be used internally to inject objects
   */
  constructor(protected injector: Injector) {
    super()
    
    // execute injectors

    TypeDescriptor.forType(this.constructor as Type<any>).inject(this, injector)

    // link parent

    const parent = injector.get(AbstractFeature, undefined, {skipSelf: true, optional: true})
    if ( parent ) {
      this.linkParent(this.parent = parent)

      injector.get(FeatureManager).onCreate(this)

      this.onDestroy(() => {
        this.unlinkParent()

        injector.get(FeatureManager).onDestroy(this)
      })
    }
  }

  // public

  getConfiguration() : FeatureConfig {
     return  (<any>this.constructor)['$$config']
  }

  // protected

  protected inject<T>(token: ProviderToken<T>, notFoundValue?: T, options?: InjectOptions | InjectFlags) : T {
    return this.injector.get<T>(token, notFoundValue, options)
  }

  // private

  private linkParent(parent?: AbstractFeature) {
    if (parent) {
      if (Tracer.ENABLED)
        Tracer.Trace('feature', TraceLevel.HIGH, 'link to parent');

      parent.children.push(this);
    }
  }

  private unlinkParent() {
    if (this.parent) {
      if (Tracer.ENABLED)
        Tracer.Trace('feature', TraceLevel.HIGH, 'unlink from parent');

      this.parent.children.splice(this.parent.children.indexOf(this), 1);
      this.parent = undefined;
    }
  }

  protected getSelector(): string {
    if ((<any>this.constructor)["$$config"])
      return (<any>this.constructor)["$$config"].componentDefinition.selectors[0][0]
    else
      return (<any>this.constructor).ecmp.selectors[0][0]
  }
}
