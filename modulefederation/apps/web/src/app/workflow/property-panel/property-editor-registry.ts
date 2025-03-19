/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Type } from '@angular/core';
import { PropertyEditor } from './property-editor';
import { TraceLevel, Tracer } from '@modulefederation/common';

// the registry

@Injectable({providedIn: "root"})
export class PropertyEditorRegistry {
  // instance data

  registry: {[type: string] : Type<PropertyEditor>} = {}

  // public

  register(type: string, component: Type<PropertyEditor>) {
    if ( Tracer.ENABLED)
      Tracer.Trace("workflow", TraceLevel.FULL, "register editor {0}", type)


    this.registry[type] = component
  }

  get(type: string) : Type<PropertyEditor> {
     if ( Tracer.ENABLED)
        Tracer.Trace("workflow", TraceLevel.FULL, "fetch editor for {0}", type) 

    const result = this.registry[type]

    return result
    /*if ( result )
      return result
    else
      throw new Error("no registered type " + type)*/
  }
}
