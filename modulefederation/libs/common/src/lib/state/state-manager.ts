import { Injectable } from '@angular/core';
import { StateData } from './stateful.decorator';
import { StateDescriptor } from './state-descriptor';

/**
 * A <code>StateManager</code> is responsible to fetch and restore states of specific class instances.
 * A state is a simple javascript object that covers a number of internal properties that can be persisted and later used to restore a previous
 * state. Usually we will cover ui related aspects e.g. layout information ,etc.
 * While this can be implemented manually, of course, we want to simplify the process a bit by making use of decorators that we can use to mark specific properties.
 */
@Injectable({ providedIn: 'root' })
export class StateManager {
  // constructor

  constructor() {}

  // private

  private static descriptor(instance: any): StateDescriptor | undefined {
    if (instance) {
      let descriptor = instance.constructor.$$stateDescriptor;

      if (!descriptor)
         (descriptor = new StateDescriptor(instance.constructor)).properties(); // force initialization and cache!

      return descriptor;
    }
    else return undefined;
  }

  // public

  /**
   * fetch the state according to the appropriate decorators
   * @param instance the instance
   * @param state an optional state object that will be filled, empty object otherwise
   */
  static fetch(instance: any, state: any = {}): StateData {
    StateManager.descriptor(instance)!.fetch(instance, state)

    return state
  }

  /**
   * restore a saved state given an instance and the state object
   * @param instance the instance
   * @param state the state object
   */
  static restore(instance: any, state: any): StateManager {
    StateManager.descriptor(instance)!.restore(instance, state)

    return StateManager
  }
}
