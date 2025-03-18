/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, Input, OnInit } from "@angular/core"
import { PropertyEditor } from "./property-editor"
//import { PropertyEditorDirective } from "./property.editor.directive"
import  {Element, PropertyDescriptor, Moddle } from "moddle"
import { Group } from "../property-panel.model"

import { Shape } from "bpmn-js/lib/model/Types";
import { ValidationError } from "../../validation";
import { PropertyGroupComponent } from "../property-group";

@Component({
  template: '<div></div>'
})
export abstract class AbstractExtensionEditor implements PropertyEditor, OnInit { 
  // input

  @Input() shape!: Shape
  @Input() element!: Element
  @Input() property!: PropertyDescriptor // TODO unused
  @Input() group!: PropertyGroupComponent
  @Input() editor!: any//PropertyGroupComponent

  model!: Moddle

  // public

  get<T>(property: string) : T {
    return this.element[property] as T
  }

  set<T>(property: string, value: T) : void {
     this.element[property] = value
  }

  // abstract

  isDirty() : boolean  {
    return false
  }

  undo() : void {}

  showError(error: ValidationError) {}
   
  // callback

  onChange(event: any) {

  }

  // implement OnInit

  ngOnInit(): void {
    this.model = this.element["$model"]
  }
}
