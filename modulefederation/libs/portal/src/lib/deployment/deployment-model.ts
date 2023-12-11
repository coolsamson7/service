import {FeatureConfig} from "../feature-config";
import {ModuleMetadata} from "../modules";

export interface ModuleData {
  name: string
  ngModule: string
  file: string
  description?: string
}

export interface Manifest extends ModuleMetadata {
  //name : string,
  //version : string,
  //commitHash : string,
  remoteEntry?: string,
  module : ModuleData,
  features : FeatureConfig[],
}

export interface DeploymentConfig {
  modules: { [name: string] : Manifest }
}

