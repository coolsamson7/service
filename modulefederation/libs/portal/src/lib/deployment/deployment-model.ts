import {FeatureConfig} from "../feature-config";
import {ModuleMetadata} from "../modules";

export interface ModuleData {
  name: string
  ngModule: string
}

export interface Manifest extends ModuleMetadata {
  remoteEntry?: string,
  module : ModuleData,
  features : FeatureConfig[],
}

export interface Deployment {
  modules: { [name: string] : Manifest }
}

