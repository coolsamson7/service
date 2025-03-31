import { Element } from "moddle"

export const PropertyPanelConfigurationToken = Symbol('PropertyPanelConfigurationToken');


export interface GroupConfig {
    name: string,
    element?: string,
    hideLabel?: boolean,
    applies?:(element: Element) => boolean,
    extension?: string,
    multiple?: boolean,
    properties: string[]
  }

  export interface PropertyPanelConfig {
    editors: any[]
    groups: GroupConfig[]
  }
