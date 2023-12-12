import {FeatureConfig} from "./feature-config";

export function RegisterFeature(config : FeatureConfig) {
  return (ctor : Function) => {
    // actually not need anymore
    // (ctor as any).$$feature = config
  }
}
