/* eslint-disable @angular-eslint/component-class-suffix */
import { Component } from '@angular/core';

import { AbstractExtensionEditor, RegisterPropertyEditor, PropertyPanelModule } from '../../property-panel';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Element } from "moddle"

@RegisterPropertyEditor("camunda:InputOutput")
@Component({
  selector: "input-output-editor",
  templateUrl: './input-output.html',
  styleUrl: './input-output.scss',
  standalone: true,
  imports: [FormsModule, CommonModule, PropertyPanelModule]
})
export class InputOutputEditor extends AbstractExtensionEditor {
  // instance data

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
    parameter.value = ""

    this.actionHistory.updateProperties({
      element: this.shape,
      moddleElement: this.element as any as Element,
      properties: {
        inputParameters: [...this.element['inputParameters'], parameter]
      }
    })

    //this.element['inputParameters'].push(parameter)

    return parameter
  }

  addOutput() : Element {
    const parameter =  this.create("schema:outputParameter")

    parameter.$parent = this.element
    parameter.type = "String"

    this.actionHistory.updateProperties({
      element: this.shape,
      moddleElement: this.element as any as Element,
      properties: {
        inputParameters: [...this.element['outputParameters'], parameter]
      }
    })


    //this.element['outputParameters'].push(parameter)

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
  }
}