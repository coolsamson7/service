import {FeatureConfig} from "./feature-config";

export function Feature(config : FeatureConfig) {
  return (ctor : Function) => {
    // actually not need anymore
    // (ctor as any).$$feature = config ->  this is done in the route registry process :-)
  }
}
