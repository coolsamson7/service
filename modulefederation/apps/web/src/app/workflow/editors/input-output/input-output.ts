/* eslint-disable @angular-eslint/component-class-suffix */
import { Component } from '@angular/core';

import { AbstractExtensionEditor, PropertyEditorModule, RegisterPropertyEditor } from '../../property-panel/editor';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Element } from "moddle"

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

  parameterName(element: Element) {
    return (element["name"] || "<name>") + " : " +  (element["type"] || "<type>" )
  }

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
    parameter.source = "value"

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

      this.properties = this.element.$descriptor.properties.filter((prop) => prop.name == "event" || prop.name == "class" ||prop.name == "expression" ) // TODO

  }
}