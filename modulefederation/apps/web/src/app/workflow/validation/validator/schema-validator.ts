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
  // private

    private findInputProperties(context: ValidationContext) : Element[] {
      const result : Element[] = []
      const extensionElements = context.process.extensionElements
      const extensions = extensionElements ? extensionElements.values: []

      extensions.filter((extension: any) => extension["$type"] == "schema:schema" &&  extension["name"] == "input").forEach((schema: any) =>
        schema["properties"].forEach((property: any) => result.push(property)) // TODO schema name?
       )

       return result
    }

    private isAssignableFrom(t1: string, t2: string) : boolean {
      return t1 == t2 // for now TODO! coerce?
    }

    // override

  override validate(shape: Shape, element: Element, context: ValidationContext) : void {
    // type / name / value

    this.checkRequired(shape, element, "name", context )
    this.checkRequired(shape, element, "type", context )

    if ( element["source"] == "input") {
        const input = this.findInputProperties(context).find(input => input["name"] == element["value"])

        if ( !input)
            context.error(shape, element, "value", `unknown input parameter ${element["value"]}`)
        
        else if (!this.isAssignableFrom(input["type"], this.get<string>(element, "type")))
            context.error(shape, element, "value", "type mismatch")
      }
  }
}

