import { FeatureConfig } from "../feature-config";

export class AbstractFeature {
    // instance data

    protected config : FeatureConfig

    // constructor

    constructor() {
        this.config = (this.constructor as any).$$feature;
    }

    // protected

    getName() : string {
        return this.config.id
    }

    // ...
}
