/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, Input, OnInit } from "@angular/core"
import { PropertyEditor } from "./property-editor"
//import { PropertyEditorDirective } from "./property.editor.directive"
import  {Element, PropertyDescriptor, Moddle } from "moddle"
import { BaseElement } from "bpmn-moddle"
import { Group } from "../property-panel.model"

@Component({
  template: '<div></div>'
})
export abstract class AbstractExtensionEditor implements PropertyEditor, OnInit { 
  // input

  @Input() element!: Element
  @Input() property!: PropertyDescriptor // TODO unused
  @Input() component! : any//PropertyEditorDirective
  @Input() config!: Group

  model!: Moddle

  // callback

  onChange(event: any) {

  }

  // implement OnInit

  ngOnInit(): void {
    this.model = this.element["$model"]
  }
}
