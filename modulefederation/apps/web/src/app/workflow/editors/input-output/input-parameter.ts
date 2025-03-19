/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, ViewChild } from '@angular/core';

import { AbstractExtensionEditor, EditorHints, PropertyEditorModule, RegisterPropertyEditor } from '../../property-panel/editor';

import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ArraySuggestionProvider, SuggestionProvider } from '@modulefederation/portal';

import { Element } from "moddle"
import { MatInputModule } from '@angular/material/input';

import { DataTypes } from '../../util/data-types';
import { MatSelectModule } from '@angular/material/select';
import { PropertyNameComponent } from '../../property-panel/property-name';


@RegisterPropertyEditor("schema:inputParameter")
@Component({
  selector: "input-parameter",
  templateUrl: './input-parameter.html',
  styleUrl: './input-parameter.scss',
  standalone: true,
  imports: [FormsModule, CommonModule, PropertyEditorModule,  MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule, PropertyNameComponent]
})
export class InputParameterEditor extends AbstractExtensionEditor {
  //

  @ViewChild('form') form!: NgForm; 

  // instance data

  properties: Moddle.PropertyDescriptor[] = []
  typedProperty!:  Moddle.PropertyDescriptor

  inputType = ""

  icons : {[type: string] : string } = {
    process: "link",
    output: "create",
    value: "link",
    expression: "create"
  }
  readOnly = false

  valueHints: EditorHints<string> = {}

  typeHints: EditorHints<string> = {
    oneOf: DataTypes.types
  }

  sourceHints: EditorHints<string> = {
    oneOf: ["value", "process", "output", "expression"]
  }

   suggestionProvider : SuggestionProvider | undefined = undefined

   typeChange(event: any) {
    this.typedProperty = this.createProperty(this.get("type"))

    this.convertType()
  }

  override onChange(event: any) {
    console.log(event)
  }

  convertType() {
    let targetType = this.get<string>("type")
    if ( this.element["source"] == "process" || this.element["source"] == "expression")
      targetType = "String"

    let value  = this.element["value"]

    if ( targetType == "Boolean")
      value = value == "true"
    else if ( ["Integer", "Short", "Long"].includes(targetType)) {
      value = parseInt(value)
    }
    else if ( ["Double"].includes(targetType))
      value = parseFloat(value)
    else
      value = value.toString()

    this.set("value", value)
  }

  createProperty(type: string) : Moddle.PropertyDescriptor {
    return {
      name: "value",
      type: type,
      ns: {
        localName: "value",
        name: "schema:value",
        prefix: "value"
      }
    }
  }

  changeSource(source: any) {
    //this.element["source"] = source

    this.setSuggestionProvider()

    if ( source == "value")
      this.typedProperty = this.createProperty(this.element["type"])
    else
      this.typedProperty = this.createProperty("String")
  }

  findProcess(element: Element) : Element {
    while ( element.$type !== "bpmn:Process")
      element = element.$parent

    return element
  }

  findProcessVariables(element: Element) : string[]{
    const process = this.findProcess(element)

    const extensions : Element[] = process['extensionElements']?.values || []

    const schema = extensions.find((extension: Element) => extension.$type == "schema:schema")
    if ( schema )
      return schema['properties'].filter((extension: Element) => extension.$type == "schema:property").map((property: any) => property["name"])
    else
      return []
  }

  setSuggestionProvider() {
    this.valueHints.suggestionProvider = undefined
    this.suggestionProvider  = undefined

    if ( this.element["source"] == "process") {
      this.suggestionProvider = new ArraySuggestionProvider(this.findProcessVariables(this.element))
    }

    else if ( this.element["source"] == "output") {
      const suggestions : string[] = []

      this.backward(((<any>this.element.$parent.$parent.$parent)["incoming"] || []).map((flow : any) => flow.sourceRef as Element), (element: Element) => {
        const inputOutput = (element['extensionElements'].values || []).find((element : any) =>
          element.$type == "camunda:InputOutput"
        )

        if ( inputOutput ) {
          for ( const outputParameter of inputOutput.outputParameters)
            suggestions.push(element.get("name") + "." + outputParameter.name)
        }
      })
      this.suggestionProvider = new ArraySuggestionProvider(suggestions)
    }

   this.valueHints.suggestionProvider = this.suggestionProvider
  }

  backward(elements: Element[], handler : (element: Element) => void) {
    const visited : any = {}

    const queue = [...elements]
    while ( queue.length > 0) {
      const next : Element = queue.splice(0, 1)[0]

      if ( !visited[next['id']]) {
        handler(next)

        visited[next['id']] = true
        queue.push(...(((<any>next)["incoming"]) || []).map((flow : any) => flow.sourceRef as Element))
      }
    }
  }

  forward(elements: Element[], handler : (element: Element) => void) {
    const visited : any = {}

    const queue = [...elements]
    while ( queue.length > 0) {
      const next : Element = queue.splice(0, 1)[0]

      if ( !visited[next['id']]) {
        handler(next)

        visited[next['id']] = true
        queue.push(...(((<any>next)["outgoing"]) || []).map((flow : any) => flow.targetRef as Element))
      }
    }
  }

  // override OnInit

  override ngOnInit() : void {
      super.ngOnInit()

      this.readOnly = this.shape["bpmnElement"].$type == "bpmn:ServiceTask"

      this.properties = this.element.$descriptor.properties.filter((prop) => ["name", "type", "source", "value"].includes(prop.name))

      this.changeSource(this.element["source"])

      this.typedProperty = this.createProperty(this.element["type"])
  }
}
