import { ValidationContext } from "../validation"
import { Element  } from "moddle"
import { RegisterValidation } from "../validation.decorator"
import { Injectable } from "@angular/core"
import { Shape } from "bpmn-js/lib/model/Types";
import { AbstractModelValidator } from "../abstract-validator";


@RegisterValidation("schema:schema")
@Injectable({providedIn: 'root'})
export class SchemaValidator extends AbstractModelValidator {
    // override

  override validate(shape: Shape, element: Element, context: ValidationContext) : void {
    for ( const property of (element["properties"] || []))
        context.push({shape: shape, element: property})
  }
}

@RegisterValidation("schema:property")
@Injectable({providedIn: 'root'})
export class SchemaPropertyValidator extends AbstractModelValidator {
    // override

  override validate(shape: Shape, element: Element, context: ValidationContext) : void {
    // type / name / value

    this.checkRequired(shape, element, "name", context )
    this.checkRequired(shape, element, "type", context )
  }
}

