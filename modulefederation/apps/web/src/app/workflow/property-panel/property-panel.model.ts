
import { PropertyDescriptor } from "moddle"
import { Element } from "moddle"

export interface Group {
  name: string,
  label?: (element: Element) => string,
  element?: string,
  extension?: string,
  multiple?: boolean,
  hideLabel?: boolean,
  properties: PropertyDescriptor[]
}

export interface PropertyPanel {
  groups: Group[]
}
