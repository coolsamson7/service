/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, ViewChild } from '@angular/core';


import { AbstractExtensionEditor, PropertyEditorModule, RegisterPropertyEditor } from '../../property-panel/editor';

import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ArraySuggestionProvider, SuggestionProvider, NgModelSuggestionsDirective } from '@modulefederation/portal';

import { Element } from "moddle"
import { MatInputModule } from '@angular/material/input';
import { ModelValidationDirective } from '../../validation';

import { Shape } from "bpmn-js/lib/model/Types";

@RegisterPropertyEditor("camunda:InputOutput")
@Component({
  selector: "input-output-editor",
  templateUrl: './input-output.html',
  styleUrl: './input-output.scss',
  standalone: true,
  imports: [FormsModule, CommonModule, PropertyEditorModule]
})
export class InputOutputEditor extends AbstractExtensionEditor {
  // instance data

  properties: Moddle.PropertyDescriptor[] = []
  openInputs: boolean[] = []
  openOutputs: boolean[] = []

  // private

  private create(type: string) {
    return this.element['$model'].create(type)
  }

  // callbacks

  deleteInput(i: number) {
    this.element['inputParameters'].splice(i, 1)
  }

  deleteOutput(i: number) {
    this.element['outputParameters'].splice(i, 1)
  }

  toggleInput(i : number) {
    this.openInputs[i] = ! this.openInputs[i]
  }

  toggleOutput(i : number) {
    this.openOutputs[i] = ! this.openOutputs[i]
  }

  addInput() : Element {
    const parameter = this.create("schema:inputParameter")

    parameter.$parent = this.element
    parameter.type = "String"

    this.element['inputParameters'].push(parameter)

    return parameter
  }

  addOutput() : Element {
    const parameter =  this.create("schema:outputParameter")

    parameter.$parent = this.element
    parameter.type = "String"

    this.element['outputParameters'].push(parameter)

    return parameter
  }

  // override OnInit

  override ngOnInit() : void {
      super.ngOnInit()

      if (!this.element['inputParameters'])
        this.element['inputParameters'] = []

      this.openInputs = this.element['inputParameters'].map((param: any) => false)

      if (!this.element['outputParameters'])
        this.element['outputParameters'] = []

      this.openOutputs = this.element['inputParameters'].map((param: any) => false)

      this.properties = this.config.properties//this.element.$descriptor.properties.filter((prop) => prop.name == "event" || prop.name == "class" ||prop.name == "expression" ) // TODO

  }
}

@RegisterPropertyEditor("schema:inputParameter")
@Component({
  selector: "input-parameter",
  templateUrl: './input-parameter.html',
  styleUrl: './input-output.scss',
  standalone: true,
  imports: [FormsModule, CommonModule, PropertyEditorModule,  MatFormFieldModule, MatInputModule, MatMenuModule, MatIconModule, NgModelSuggestionsDirective, ModelValidationDirective]
})
export class InputParameterEditor extends AbstractExtensionEditor {
  //

  @ViewChild('form') form!: NgForm; 

  // instance data

  properties: Moddle.PropertyDescriptor[] = []

  inputType = ""
  type = "value" // process,value
  value : any = ""
  icons : {[type: string] : string } = {
    process: "link",
    output: "create",
    value: "link",
    expression: "create"
  }
  readOnly = false

   suggestionProvider : SuggestionProvider | undefined = undefined

   writeValue() {
    this.element.set("value", this.type + ":" + this.value)
   }

  onValueChange(event: any) {
    this.value = event

    this.writeValue()

    this.form.controls['value'].updateValueAndValidity()
  }

  changeType(type: string) {
    this.type = type

    this.writeValue()

    this.setSuggestionProvider()
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
    this.suggestionProvider  = undefined

    if ( this.type == "process") {
      this.suggestionProvider = new ArraySuggestionProvider(this.findProcessVariables(this.element))
    }

    else if ( this.type == "output") {
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

      //this.readOnly = this.element.$parent.$parent.$parent.$type == "bpmn:ServiceTask"

      this.properties = this.element.$descriptor.properties.filter((prop) => ["name", "type", "value"].includes(prop.name))


      const value = this.element.get("value") || ""

      const colon = value.indexOf(":")

      if ( colon > 0) {
        this.type = value.substring(0, colon)
        this.value =  value.substring(colon + 1)
      }
      else {
        this.type = "value"
        this.value = value
      }

      this.changeType(this.type)
  }
}

@RegisterPropertyEditor("schema:outputParameter")
@Component({
  selector: "output-parameter",
  templateUrl: './output-parameter.html',
  styleUrl: './input-output.scss',
  standalone: true,
  imports: [FormsModule, CommonModule, PropertyEditorModule]//PropertyEditorModule
})
export class OutputParameterEditor extends AbstractExtensionEditor {
  // instance data

  properties: Moddle.PropertyDescriptor[] = []

  // override OnInit

  override ngOnInit() : void {
      super.ngOnInit()

      this.properties = this.element.$descriptor.properties.filter((prop) => ["name", "type"].includes(prop.name))

  }
}
