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
  remoteEntry?: string,
  module : ModuleData,
  features : FeatureConfig[]
}

export interface DeploymentConfig {
  modules: { [name: string] : Manifest }
}

