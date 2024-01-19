import {
  AfterContentInit,
  AfterViewInit,
  Component,
  Injector,
  OnDestroy,
  OnInit
} from '@angular/core';
import { TraceLevel, Tracer } from '../tracer';

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
declare type LifecylePhase = 'onInit' | 'onDestroy' | 'afterContentInit' | 'afterViewInit';

@Component({
  selector: 'abstract-feature',
  template: ''
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class AbstractFeature implements OnInit, AfterViewInit, AfterContentInit, OnDestroy {
  // instance data

  injector: Injector

  private lifecycleAware: LifecycleAware[] = [];

  parent?: AbstractFeature;
  children: AbstractFeature[] = [];

  // constructor

  /**
   * create a new AbstractFeature.
   * @param injector the appropriate injector that will be used internally to inject objects
   */
  constructor(injector: Injector) {
    this.injector = injector

    const parent = injector.get(AbstractFeature, undefined, {skipSelf: true, optional: true})
    if ( parent ) {
      this.linkParent(this.parent = parent)
      this.onDestroy(() => this.unlinkParent())
    }
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
   * @param lifecyle the lifecycle method
   * @protected
   * @see LifecycleAware
   */
  protected pushLifecycle(lifecyle: LifecycleAware) {
    this.lifecycleAware.push(lifecyle);
  }

  /**
   * run the appropriate methods in a specific phase ( onDestroy, onInit ) and remove if applicable
   * @param phase one of 'onDestroy', 'onInit'
   * @protected
   */
  protected executeLifecycle(phase: LifecylePhase) {
    // execute in reverse so that the splice doesn't break us

    for (let i = this.lifecycleAware.length - 1; i >= 0; i--) {
      const lifecycleAware = this.lifecycleAware[i];

      if (lifecycleAware[phase]) {
        lifecycleAware[phase]?.();

        this.lifecycleAware.splice(i, 1); // and delete
      }
    }
  }

  protected getSelector(): string {
    if ((<any>this.constructor)["$$config"])
      return (<any>this.constructor)["$$config"].componentDefinition.selectors[0][0]
    else
      return (<any>this.constructor).ecmp.selectors[0][0]
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
