import { StateData } from './stateful.decorator';
import { StateManager } from './state-manager';
import { get, set } from 'lodash';

/**
 * @internal
 */
abstract class Property {
  // constructor

  protected constructor(public name: string, public property: string, public recursive: boolean) {}

  isField() : boolean {
    return false
  }

  // public

  abstract get(instance: any): any;
  abstract set(instance: any, value: any): void;
}

/**
 * @internal
 */
export class FieldProperty extends Property {
  // constructor

  constructor(name: string, property: string, recursive: boolean) {
    super(name, property, recursive);
  }

  // implement

  override isField() : boolean {
    return true
  }

  /**
   * @inheritdoc
   */
  get(instance: any): any {
    return instance[this.name];
  }

  /**
   * @inheritdoc
   */
  set(instance: any, value: any): void {
    if (instance[this.name] && this.recursive) {
      const reference = instance[this.name]

      if ( Array.isArray(reference))
        for ( let i = 0; i < reference.length; i++)
          StateManager.restore(reference[i], value[i]);
        else
          StateManager.restore(reference, value);
    }
    else 
      instance[this.name] = value;
  }
}

/**
 * @internal
 */
export class FunctionProperty extends Property {
  // instance data

  propertyDescriptor: PropertyDescriptor;

  // constructor

  constructor(name: string, property: string, recursive: boolean, propertyDescriptor: PropertyDescriptor) {
    super(name, property, recursive);

    this.propertyDescriptor = propertyDescriptor;
  }

  // implement
  /**
   * @inheritdoc
   */
  get(instance: any): any {
    return this.propertyDescriptor.value.apply(instance);
  }
  /**
   * @inheritdoc
   */
  set(instance: any, value: any): void {
    throw new Error('set not allowed on functions');
  }
}

/**
 * @internal
 */
export class StateDescriptor {
  // instance data

  clazz: any
  private inherits: StateDescriptor | undefined
  private localProperties: Property[] = []
  private allProperties: Property[] | undefined = undefined
  private restores: Function[] = []

  // constructor

  constructor(clazz: any) {
    this.clazz = clazz;

    clazz.$$stateDescriptor = this;
  }

  // private

  public properties(): Property[] {
    if (!this.allProperties) 
      this.resolve();

    return this.allProperties!
  }

  private findSuper(): StateDescriptor | undefined {
    let clazz = Object.getPrototypeOf(this.clazz);

    while (clazz?.constructor?.name != 'Object') {
      if (clazz.$$stateDescriptor) 
        return (this.inherits = clazz.$$stateDescriptor);

      // next

      clazz = Object.getPrototypeOf(clazz);
    }

    return undefined;
  }

  private resolve(): void {
    this.allProperties = [];

    this.findSuper(); // find possible superclass

    // add from superclass

    if (this.inherits)
       this.allProperties.push(...this.inherits.properties());

    // add local

    this.allProperties.push(...this.localProperties);
  }

  // administrative

  property(property: Property): StateDescriptor {
    this.localProperties.push(property);

    return this;
  }

  function(name: string, property: string, recursive: boolean, propertyDescriptor: PropertyDescriptor): StateDescriptor {
    this.localProperties.push(new FunctionProperty(name, property, recursive, propertyDescriptor));

    return this;
  }

  field(name: string, property: string, recursive: boolean): StateDescriptor {
    this.localProperties.push(new FieldProperty(name, property, recursive));

    return this;
  }

  addRestore(propertyDescriptor: PropertyDescriptor): StateDescriptor {
    this.restores.push(propertyDescriptor.value);

    return this;
  }

  // public

  restore(instance: any, state: StateData) {
    // set properties

    for (const property of this.properties()) {
      if (property.isField()) {
        // && state.hasOwnProperty(property.property))
        const value = get(state, property.property);

        if (value)
          // hmm....
          property.set(instance, value);
      }
    }

    // call restore functions

    for (const restore of this.restores) 
      restore.apply(instance, [state]);
  }

  fetch(instance: any, state: StateData) {
    for (const property of this.properties()) {
      const value = property.get(instance);

      if (value && property.recursive) {
        if ( Array.isArray(value))
          set(state, property.property, value.map(element => StateManager.fetch(element)));
    
        else 
          set(state, property.property, StateManager.fetch(value));
      }
      else 
        set(state, property.property, value);
    }

    return state;
  }
}
