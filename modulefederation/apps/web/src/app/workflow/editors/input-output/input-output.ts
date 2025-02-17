/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, NgModule } from '@angular/core';


import { AbstractExtensionEditor, AbstractPropertyEditor, PropertyEditorModule, RegisterPropertyEditor } from '../../property-panel/editor';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


//width: 100%;
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
    const parameter = this.create("camunda:InputParameter")

    this.element['inputParameters'].push(parameter)

    return parameter
  }

  addOutput() : Element {
    const parameter =  this.create("camunda:OutputParameter")

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

      console.log(this.element)
  }
}

@RegisterPropertyEditor("camunda:InputParameter")
@Component({
  selector: "input-parameter",
  templateUrl: './input-parameter.html',
  styleUrl: './input-output.scss',
  standalone: true,
  imports: [FormsModule, CommonModule, PropertyEditorModule]
})
export class InputParameterEditor extends AbstractExtensionEditor {
  // instance data

  properties: Moddle.PropertyDescriptor[] = []

  // override OnInit

  override ngOnInit() : void {
      super.ngOnInit()

      console.log("'###### new inut")

      this.properties = this.element.$descriptor.properties.filter((prop) => prop.name == "name" ||prop.name == "value" ) // TODO

      console.log(this.element)
  }
}

@RegisterPropertyEditor("camunda:OutputParameter")
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

      console.log("'###### new inut")

      this.properties = this.element.$descriptor.properties.filter((prop) => prop.name == "name" || prop.name == "value" ) // TODO

      console.log(this.element)
  }
}
