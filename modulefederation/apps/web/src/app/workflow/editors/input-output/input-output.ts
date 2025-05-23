/* eslint-disable @angular-eslint/component-class-suffix */
import { Component } from '@angular/core';

import { AbstractExtensionEditor, RegisterPropertyEditor, PropertyPanelModule } from '../../property-panel';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Element } from "moddle"
import { ParameterListComponent } from './parameter-list';

@RegisterPropertyEditor("camunda:InputOutput")
@Component({
  selector: "input-output-editor",
  templateUrl: './input-output.html',
  styleUrl: './input-output.scss',
  standalone: true,
  imports: [FormsModule, CommonModule, PropertyPanelModule, ParameterListComponent]
})
export class InputOutputEditor extends AbstractExtensionEditor {
  // instance data

  open = new Map<Element,boolean> ()

  // getters

  get inputParameters(): Element[] {
    return this.element["inputParameters"] || []
  }

 get outputParameters(): Element[] {
    return (this.element["outputParameters"] || []).filter((parameter: { $type: string; }) => parameter.$type == "schema:outputParameter");
  }

  get processOutputParameters(): Element[] {
    return (this.element["outputParameters"] || []).filter((parameter: { $type: string; }) => parameter.$type == "camunda:OutputParameter");
  }

  // callbacks

  isOpen(property: Element) {
    return this.open.get(property)
  }

  toggle(parameter: Element) {
    this.open.set(parameter, !this.isOpen(parameter))
  }

  delete(parameter: Element) {
    let properties: any

    let parameters;
    let index = this.inputParameters.indexOf(parameter)
    if ( index >= 0) {
      parameters =  [...this.inputParameters]
      properties = {
        inputParameters: parameters
      }
    }
    else {
      index = this.outputParameters.indexOf(parameter)
      parameters = [...this.outputParameters]
      properties = {
             outputParameters: parameters
      }
    }

    parameters.splice(index,1)

    this.actionHistory.updateProperties({
      element: this.context.shape,
      moddleElement: this.element as any as Element,
      properties: properties
    })
  }

  addInput() : Element {
    const parameter = this.create("schema:inputParameter", {
       type:"String",
       source: "value",
       value: ""
      })

    this.actionHistory.updateProperties({
      element: this.context.shape,
      moddleElement: this.element as any as Element,
      properties: {
        inputParameters: [...this.inputParameters, parameter]
      }
    })

    return parameter
  }

  addOutput() : Element {
    const parameter =  this.create("schema:outputParameter", {
      type: "String"
      })

    this.actionHistory.updateProperties({
      element: this.context.shape,
      moddleElement: this.element as any as Element,
      properties: {
        outputParameters: [...this.outputParameters, parameter]
      }
    })

    return parameter
  }

  addProcessOutput() : Element {
    const parameter =  this.create("camunda:OutputParameter", {
      type: "String"
      })

    this.actionHistory.updateProperties({
      element: this.context.shape,
      moddleElement: this.element as any as Element,
      properties: {
        outputParameters: [...this.outputParameters, parameter]
      }
    })

    return parameter
  }

  inputName(parameter: Element) : string {
    if ( parameter["name"] && parameter["name"].trim().length > 0)
      return parameter["name"] + " : " +  parameter["type"] + " = " + parameter["value"]
    else
      return "<name>" + " : " + parameter["type"]
  }

  outputName(parameter: Element) : string {
    if ( parameter["name"] && parameter["name"].trim().length > 0)
      return parameter["name"] + " : " +  parameter["type"]
    else
      return "<name>" + " : " + parameter["type"]
  }

  processOutputName(parameter: Element) : string {
    return parameter["name"].trim()
  }

  // override OnInit

  override ngOnInit() : void {
      super.ngOnInit()

      if (!this.inputParameters)
        this.element['inputParameters'] = []

      if (!this.outputParameters)
        this.element['outputParameters'] = []

      this.inputParameters.forEach(parameter => {this.open.set(parameter, false)})
      this.outputParameters.forEach(parameter => {this.open.set(parameter, false)})
  }
}
