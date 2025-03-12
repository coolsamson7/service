import  { Element  } from "moddle"
import ElementRegistry from 'diagram-js/lib/core/ElementRegistry';
import { Injectable } from '@angular/core';
import { Shape } from "bpmn-js/lib/model/Types";
import { Process } from "bpmn-moddle";
import { ValidationError } from "./validation-error";
import { ModelValidator } from "./validator";


interface ShapeElement {
   shape: Shape,
   element: Element
}

export class ValidationContext {
  // instance data

  queue: ShapeElement[] = []
  errors: ValidationError[] = []

  // constructor

  constructor(public process: Process) {
  }

  // public

  push(shapeElement: ShapeElement) : void {
    this.queue.push(shapeElement)
  }

  error(shape: Shape, element: Element, property: string,  error: string) {
    this.errors.push({shape, element, property, error})
  }
}


@Injectable({providedIn: 'root'})
export class ModelValidation {
  // instance

  validations: ModelValidator[] = []
  validationCache : {[type: string] : ModelValidator[]} = {}

  // constructor

  constructor() {
  }

  // administration

  register(validation: ModelValidator) {
    this.validations.push(validation)
  }

  findValidations(element: Element) : ModelValidator[] {
    let validations = this.validationCache[element.$descriptor.name]
    if ( !validations ) {
      validations = []

      for ( const validation of this.validations)
        if ( validation.accepts(element))
          validations.push(validation)

      this.validationCache[element.$descriptor.name] = validations
    }

    return validations
  }


  // public

  validateElement(process: Process, shape: Shape, element: Element): ValidationError[] {
    const context = new ValidationContext(process);

    context.push({shape, element})

    while ( context.queue.length > 0) {
      const shapeElement = context.queue.shift()!

      for ( const validation of this.findValidations(shapeElement.element))
        validation.validate(shapeElement.shape, shapeElement.element, context)
    } // while

    return context.errors
  }

  validate(process: Process, elementRegistry: ElementRegistry) : ValidationError[] {
    const context = new ValidationContext(process);

    elementRegistry.forEach(element => context.push({shape: element as Shape, element: element.businessObject}))

    while ( context.queue.length > 0) {
      const shapeElement = context.queue.shift()!

      for ( const validation of this.findValidations(shapeElement.element))
        try {
          validation.validate(shapeElement.shape, shapeElement.element, context)
        }
        catch(e) {
          context.error(shapeElement.shape, shapeElement.element, "", "unknown error") // TODO
        }
    } // while

    return context.errors
  }
}