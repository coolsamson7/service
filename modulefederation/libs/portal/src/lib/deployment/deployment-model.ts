import { FeatureConfig } from "../feature-config";
import { ModuleMetadata } from "../modules";

export interface ModuleData {
  name : string
  ngModule : string
}

export interface Manifest extends ModuleMetadata {
  enabled? : boolean
  remoteEntry? : string,
  module : string,
  features : FeatureConfig[],
}

export interface Deployment {
  modules : { [name : string] : Manifest }
}

