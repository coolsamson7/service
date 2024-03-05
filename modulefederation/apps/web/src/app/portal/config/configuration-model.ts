
export interface ConfigurationData {
  type: "object" | "string" | "boolean" | "number" 
  name?: string
  value: any
  overwrite?: boolean
  inherits?: ConfigurationData
}
