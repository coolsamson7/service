import { Element  } from "moddle"
import { Shape } from "bpmn-js/lib/model/Types";
import { ModelValidator } from "./validator";
import { ValidationContext } from "./validation";


export abstract class AbstractModelValidator implements ModelValidator {
    type!: string

    // implement

  accepts(element: Element) : boolean {
    return element.$instanceOf(this.type)
  }

  validate(shape: Shape, element: Element, context: ValidationContext) : void {}

  // protected

  protected get<T>(element: Element, property: string) : T {
    return element[property] as T
  }

  checkRequired(shape: Shape, element: Element, property: string,  context: ValidationContext) : boolean {
    if ( element[property] == undefined) {
      context.error(shape, element, property, `${property} is required`)
      return false
    }

    return true
  }

  checkNonEmpty(shape: Shape, element: Element, property: string,  context: ValidationContext): boolean {
    if ( !element[property] || element[property].trim().length == 0) {
      context.error(shape, element, property, `${property} must be non empty`)
      return false
    }

    return true
  }
}
