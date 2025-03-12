/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, Input } from "@angular/core";
import { PropertyEditor } from "./property-editor";
//import { PropertyEditorDirective } from "./property.editor.directive";

import  {Element, PropertyDescriptor  } from "moddle"
import { Shape } from "bpmn-js/lib/model/Types";

@Component({
  template: '<div></div>'
})
export abstract class AbstractPropertyEditor implements PropertyEditor {
  // input

  @Input() shape!: Shape
  @Input() element!: Element
  @Input() readOnly = false
  @Input() property!: PropertyDescriptor
  @Input() component!: any//PropertyEditorDirective

  // getter & setter

  get value() : any {
    return this.element.get(this.property.name)
  }

  set value(value: any) {
    this.element.set(this.property.name, value)
  }

  // callback

  onChange(event: any) {
    // TODO???
    console.log(event)
  }
}
