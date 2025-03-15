/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, Input } from "@angular/core";
import { PropertyEditor } from "./property-editor";
//import { PropertyEditorDirective } from "./property.editor.directive";

import  {Element, PropertyDescriptor  } from "moddle"
import { Shape } from "bpmn-js/lib/model/Types";
import { ValidationError } from "../../validation";
import { SuggestionProvider } from "@modulefederation/portal";

export interface EditorHints<T> {
  suggestionProvider?: SuggestionProvider
  oneOf?: T[]
}

@Component({
  template: '<div></div>'
})
export abstract class AbstractPropertyEditor<T=any> implements PropertyEditor<T> {
  // input

  @Input() shape!: Shape
  @Input() element!: Element
  @Input() readOnly = false
  @Input() property!: PropertyDescriptor
  @Input() hints : EditorHints<T> = {}
  @Input() component!: any//PropertyEditorDirective

  // getter & setter

  get value() : any {
    return this.element.get(this.property.name)
  }

  set value(value: any) {
    this.element.set(this.property.name, value)
  }

  showError(error: ValidationError) {}

  // callback

  onChange(event: any) {
    // TODO???
    console.log(event)
  }
}
