import { ValidationContext } from "../validation"
import { Element  } from "moddle"
import { RegisterValidation } from "../validation.decorator"
import { Injectable } from "@angular/core"
import { Shape } from "bpmn-js/lib/model/Types";
import { AbstractModelValidator } from "../abstract-validator";


@RegisterValidation("bpmn:BaseElement")
@Injectable({providedIn: 'root'})
export class ExtensionValidator extends AbstractModelValidator {
    // override

  override validate(shape: Shape, element: Element, context: ValidationContext) : void {
    const extensionElements = element["extensionElements"]
    if ( extensionElements )
      for ( const extension of (extensionElements["values"] || []))
        context.push({shape: shape, element: extension})
  }
}
