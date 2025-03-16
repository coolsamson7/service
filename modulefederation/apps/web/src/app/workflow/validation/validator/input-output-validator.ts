import { ValidationContext } from "../validation"

import  { Element  } from "moddle"
import { RegisterValidation } from "../validation.decorator"
import { Injectable } from "@angular/core"
import { Shape } from "bpmn-js/lib/model/Types";
import { AbstractModelValidator } from "../abstract-validator";


@RegisterValidation("camunda:InputOutput")
@Injectable({providedIn: 'root'})
export class InputOutputValidator extends AbstractModelValidator {
  override validate(shape: Shape, element: Element, context: ValidationContext) : void {
    // input

    for ( const inputParameter of (element["inputParameters"] || []))
      context.push({shape: shape, element: inputParameter})

    // output

    for ( const outputParameter of (element["outputParameters"] || []))
      context.push({shape: shape, element: outputParameter})
  }
}

@RegisterValidation("schema:inputParameter")
@Injectable({providedIn: 'root'})
export class InputParameterValidator extends AbstractModelValidator {
  // private

  private findProperties(context: ValidationContext) : Element[] {
    const result : Element[] = []
    const extensionElements = context.process.extensionElements
    const extensions = extensionElements ? extensionElements.values: []

    extensions.filter((extension: any) => extension["$type"] == "schema:schema").forEach((schema: any) =>
      schema["properties"].forEach((property: any) => result.push(property))
     )

     return result
  }

  private isAssignableFrom(t1: string, t2: string) : boolean {
    return t1 == t2 // for now
  }

  private findOutput(element: Element, output: string) : Element | undefined {
    let match : Element | undefined = undefined

    this.backward(((<any>element.$parent.$parent.$parent)["incoming"] || []).map((flow : any) => flow.sourceRef as Element), (element: Element) => {
      const inputOutput = (element['extensionElements'].values || []).find((element : any) =>
        element.$type == "camunda:InputOutput"
      )

      if ( inputOutput ) 
        for ( const outputParameter of inputOutput.outputParameters) {
          const name = this.get<string>(element, "name") + "." + outputParameter.name
          if (name === output) {
            match = outputParameter
            return true
          } // if
      }

      return false
    })

    return match
  }
    
  backward(elements: Element[], handler : (element: Element) => boolean) {
    const visited : any = {}

    const queue = [...elements]
    while ( queue.length > 0) {
      const next : Element = queue.splice(0, 1)[0]

      if ( !visited[next['id']]) {
        if (handler(next))
          return

        visited[next['id']] = true
        queue.push(...(((<any>next)["incoming"]) || []).map((flow : any) => flow.sourceRef as Element))
      }
    }
  }

  private checkProcessVariable(shape: Shape, element: Element, variable: string, type: string, context: ValidationContext) {
    const property = this.findProperties(context).find(prop => this.get(prop, "name") == variable)

    if (!property)
      context.error(shape, element, "value", `unknown process variable ${variable}`)
    else if (!this.isAssignableFrom(type, this.get(property, "type")))
      context.error(shape, element, "value", `type mismatch`)
  }

  private checkOutputVariable(shape: Shape, element: Element, variable: string, type: string, context: ValidationContext) {
    const output = this.findOutput(element, variable)
    if ( !output )
      context.error(shape, element, "value", `unknown output parameter ${variable}`)
    else if (!this.isAssignableFrom(type, this.get<string>(output, "type")))
      context.error(shape, element, "value", "type mismatch")
  }
  

  private checkValue(shape: Shape, element: Element, context: ValidationContext) : void {
    const type  = this.get<string>(element, "type") // string
    const source  = this.get<string>(element, "source") // process...
    const value = this.get<string>(element, "value") // 

    if (source == "process")
      this.checkProcessVariable(shape, element, value, type, context)
       
    else if (source == "output")
      this.checkOutputVariable(shape, element, value, type, context)

    // TODO: expression, value?
  }

  // override

  override validate(shape: Shape, element: Element, context: ValidationContext) : void {
    this.checkRequired(shape, element, "type", context)
    this.checkRequired(shape, element, "source", context)
    this.checkRequired(shape, element, "name", context)

    if (this.checkRequired(shape, element, "value", context))
      this.checkValue(shape, element, context)
  }
}