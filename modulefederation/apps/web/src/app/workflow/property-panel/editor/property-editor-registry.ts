/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Type } from '@angular/core';
import { PropertyEditor } from './property-editor';

// the registry

@Injectable({providedIn: "root"})
export class PropertyEditorRegistry {
  // instance data

  registry: {[type: string] : Type<PropertyEditor>} = {}

  // public

  register(type: string, component: Type<PropertyEditor>) {
    console.log("### register " + type)
    this.registry[type] = component
  }

  get(type: string) : Type<PropertyEditor> {
    console.log("### fetch " + type)
    const result = this.registry[type]

    return result
    /*if ( result )
      return result
    else
      throw new Error("no registered type " + type)*/
  }
}
