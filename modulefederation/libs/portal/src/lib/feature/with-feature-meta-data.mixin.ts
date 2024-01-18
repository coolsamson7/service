import { AbstractFeature } from "../feature";
import { FeatureConfig } from "../feature-config";
import { registerMixins } from "../mixin/mixin";

type Constructor<T = any> =  new (...args: any[]) => T;

export interface FeatureMetaData {
    getConfiguration() : FeatureConfig
}

export function WithFeatureMetaData<T extends Constructor<AbstractFeature>>(base: T) :Constructor<FeatureMetaData> &  T  {
    return registerMixins(class extends base implements FeatureMetaData {
       // constructor

       constructor(...args: any[]) {
         super(...args);
       }

       // implement FeatureMetaData

       getConfiguration() : FeatureConfig {
          return  (<any>this.constructor)['$$config']
       }
    }, WithFeatureMetaData)
  }
