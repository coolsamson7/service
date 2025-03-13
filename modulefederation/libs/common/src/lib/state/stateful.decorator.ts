/* eslint-disable no-prototype-builtins */
import { FieldProperty, FunctionProperty, StateDescriptor } from './state-descriptor';

/**
 * a container for properties covering the state
 */
export interface StateData {
  /**
   * any properties
   */
  [prop: string]: any;
}

// decorator

/**
 * a class decorated with {@link Stateful} can decorate properties with {@link State}
 * and will tell the class {@link StateManager} how to fetch and restore states automatically.
 * @constructor
 */
export const Stateful = (): ClassDecorator => {
  return (componentClass: any) => {
    import('./state.module').then((m) => {

      m.StateManagerModule.injector.subscribe((injector) => {
        // remember meta data

        const descriptor = new StateDescriptor(componentClass);

        // collect properties

        const state = (componentClass as any).$$state;

        for (const property in state || []) 
          descriptor.property(state[property]);

        // collect possible restore functions

        const restores = (componentClass as any).$$restorestate;

        for (const restore in restores || {}) 
          descriptor.addRestore(restores[restore]);

        // register

        m.StateManagerModule.descriptors.push(descriptor);
      })
    });
  };
};

/**
 * A method decorated with {@link RestoreState} will be called by the {@link StateManager} whenever a state is restored.
 * as an argument the state object is passed.
 * @constructor
 */
export function RestoreState() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const clazz = target.constructor;

    if (!clazz.hasOwnProperty('$$restorestate'))
       clazz['$$restorestate'] = {};

    const register = clazz.$$restorestate;

    // add defaults

    register[propertyKey] = descriptor;
  };
}

/**
 * configuration interface for teh decorator {@link State}
 */
export interface StateProperty {
  /**
   * if set ,this property will determine the property name in the state object
   */
  property?: string;
  /**
   * if <code>true</code>, the satte manager will try to recursively fetch and restore states.
   */
  recursive?: boolean;
}

/**
 * A property decorated with {@link State} will automatically be considered by the {@link StateManager}
 * If a configuration object is passed, that sets <code>recursive</code> to <code>true</code> it is assumed that the referenced object
 * is stateful as well and will trigger a recursive call to fetch / Set
 * @param property
 * @constructor
 */
export function State(property?: string | StateProperty) {
  return function (target: any, propertyKey: string, descriptor?: PropertyDescriptor) {
    if (!target.constructor.hasOwnProperty('$$state')) target.constructor['$$state'] = {};

    const register = target.constructor.$$state;

    let propertyPath;

    let recursive = false;
    if (property) {
      if (typeof property == 'string') propertyPath = property;
      else {
        propertyPath = property.property || propertyKey;
        recursive = property.recursive || false;
      }
    }
 else propertyPath = propertyKey;

    // add defaults

    register[propertyKey] = descriptor
      ? new FunctionProperty(propertyKey, propertyPath, recursive, descriptor)
      : new FieldProperty(propertyKey, propertyPath, recursive);
  };
}
