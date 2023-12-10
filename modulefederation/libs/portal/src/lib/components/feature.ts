import {FeatureConfig} from "../feature-config";

export class Feature {
  // instance data

  config: FeatureConfig

  // constructor

  constructor() {
    this.config = (this.constructor as any).$$feature;
  }

  // protected

  getName() : string {
    return this.config.name
  }

  // ...
}
