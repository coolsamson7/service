/* eslint-disable @typescript-eslint/no-explicit-any */
//import { PropertyEditorDirective } from "./property.editor.directive"
import { BaseElement } from "bpmn-moddle"
import  {Element, PropertyDescriptor  } from "moddle"


export type PropertyEditor = {
  element: Element
  property: PropertyDescriptor
  component: any//PropertyEditorDirective,

  value?: any 
}
