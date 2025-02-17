
import { PropertyDescriptor } from "moddle"



  export interface Group {
    name: string,
    element?: string,
    extension?: string,
    multiple?: boolean,
    properties: PropertyDescriptor[]
  }

  export interface PropertyPanel {
    groups: Group[]
  }
