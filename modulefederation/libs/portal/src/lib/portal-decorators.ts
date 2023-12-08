
export interface FeatureConfig {
  parent?: string
  name: string
  description?: string
  isDefault?: boolean
  label?: string
  component?: string
  tags?: string[]
  categories?: string[]
  visibility?:string[]
  permissions?: string[]
  featureToggles?: string[]
}

export function RegisterFeature(config: FeatureConfig) {
  console.log(config)
  return (ctor: Function) => {
    console.log("RegisterFeature: " + config.name);
  }
}

export interface ModuleConfig {
  name: string
  description?: string
}

export function RegisterModule(config: ModuleConfig) {
  console.log(config)
  return (ctor: Function) => {
    console.log("RegisterModule: " + config.name);
  }
}
