
import { PropertyDescriptor } from "moddle"



  export interface Group {
    name: string,
    element?: string,
    extension?: string,
    multiple?: boolean,
    hideLabel?: boolean,
    properties: PropertyDescriptor[]
  }

  export interface PropertyPanel {
    groups: Group[]
  }
