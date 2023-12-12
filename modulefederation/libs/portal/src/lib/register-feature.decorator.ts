import {FeatureConfig} from "./feature-config";

export function RegisterFeature(config : FeatureConfig) {
  return (ctor : Function) => {
    (ctor as any).$$feature = config
  }
}
