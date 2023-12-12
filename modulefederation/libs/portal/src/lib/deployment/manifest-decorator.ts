import { ObjectDecorator } from "../util";
import {Manifest} from "./deployment-model";

export class ManifestDecorator {
  // static

  static FeatureDecorator = new ObjectDecorator()
    //.defaultValue("label", "")
    .defaultValueFunction("permissions", (object: any) => object.name)
    .defaultValue("tags", [])
    .defaultValue("categories", [])
    .defaultValue("visibility", [])
    .defaultValue("featureToggles", [])

  static decorate(manifest: Manifest) {
    for ( let feature of manifest.features)
      ManifestDecorator.FeatureDecorator.decorate(feature)
  }
}
