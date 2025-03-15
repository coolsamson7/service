/* eslint-disable @typescript-eslint/no-explicit-any */
//import { PropertyEditorDirective } from "./property.editor.directive"
import  {Element, PropertyDescriptor  } from "moddle"


export type PropertyEditor<T=any> = {
  element: Element
  property: PropertyDescriptor
  component: any//PropertyEditorDirective,

  value?: T 
}
