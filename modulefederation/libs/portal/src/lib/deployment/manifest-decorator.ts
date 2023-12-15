import {ObjectDecorator} from "../util";
import {Manifest} from "./deployment-model";
import { FeatureConfig } from "../feature-config";
import { FeatureData } from "../portal-manager";

export class ManifestDecorator {
    // static

    static FeatureDecorator = new ObjectDecorator()
        .defaultValueFunction("label", (object : any) => object.name)
        .defaultValue("tags", [])
        .defaultValue("permissions", [])
        .defaultValue("categories", [])
        .defaultValue("visibility", [])
        .defaultValue("featureToggles", [])

    static decorate(manifest : Manifest) {
      let decorateFeature = (feature: FeatureData) => {
        ManifestDecorator.FeatureDecorator.decorate(feature)

        if ( feature.children)
          for ( let child of feature.children)
            decorateFeature(child)
      }

        for (let feature of manifest.features) {
          decorateFeature(feature)
        }
    }
}
