import { Injectable } from '@angular/core';
import { AbstractFeature } from './abstract-feature';

export interface FeatureListener {
  /**
   * a feature has been created
   * @param feature the feature
   */
  created(feature: AbstractFeature): void;

  /**
   * a feature has been destroyed
   * @param feature the feature
   */
  destroyed(feature: AbstractFeature): void;
}


/**
 * A <code>FeatureManager</code> is responsible to collect and trigger {@link FeatureListener}s
 */
@Injectable({ providedIn: 'root' })
export class FeatureManager {
  // instance data

  private listener: FeatureListener[] = [];

  // public

  /**
   * trigger all registered listeners <code>created</code> method
   * @param feature the feature
   */
  onCreate(feature: AbstractFeature): void {
    for (const listener of this.listener)
      listener.created(feature);
  }

  /**
   * trigger all registered listeners <code>destroyed</code> method
   * @param feature the controller
   */
  onDestroy(feature: AbstractFeature): void {
    for (const listener of this.listener)
      listener.destroyed(feature);
  }

  // public

  /**
   * add a listener
   * @param listener a listener
   * @return the unsubscribe function
   */
  addListener(listener: FeatureListener): () => void {
    this.listener.push(listener);

    return () => {
      this.removeListener(listener);
    }
  }

  /**
   * remove the listener
   * @param listener a listener
   */
  removeListener(listener: FeatureListener) {
    this.listener.splice(this.listener.indexOf(listener), 1);
  }
}
