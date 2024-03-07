
export interface ConfigurationProperty {
  type: "object" | "string" | "boolean" | "number" 
  name?: string
  value: any
  overwrite?: boolean
  inherits?: ConfigurationProperty
}
