/* eslint-disable @typescript-eslint/no-explicit-any */
//import { PropertyEditorDirective } from "./property.editor.directive"
import  {Element, PropertyDescriptor  } from "moddle"
import { ValidationError } from "../../validation"


export interface PropertyEditor<T=any> {
  element: Element,
  property: PropertyDescriptor,
  group: any//PropertyEditorDirective,
  editor: any,

  value?: T,

  isDirty() : boolean 
  undo() : void
  showError(error: ValidationError, select: boolean) : void
  checkState() : void
}
