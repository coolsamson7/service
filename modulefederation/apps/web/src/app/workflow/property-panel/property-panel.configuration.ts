export const PropertyPanelConfigurationToken = Symbol('PropertyPanelConfigurationToken');


export interface GroupConfig {
    name: string,
    element?: string,
    extension?: string,
    multiple?: boolean,
    properties: string[]
  }

  export interface PropertyPanelConfig {
    groups: GroupConfig[]
  }
