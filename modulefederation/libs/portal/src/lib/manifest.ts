import {FeatureConfig} from "./portal-decorators";

export interface ModuleData {
  name: string
  ngModule: string
  file: string
  description?: string
}



export interface Manifest {
  name : string,
  version : string,
  commitHash : string,
  module : ModuleData,
  features : FeatureConfig[]
}
