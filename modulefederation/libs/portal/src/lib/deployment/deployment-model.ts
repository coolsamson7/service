import {FeatureConfig} from "../feature-config";

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

export interface DeploymentConfig {
  name: string
  remotes: { [name: string] : string } // name -> url
  modules: { [name: string] : Manifest }
}

