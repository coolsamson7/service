import { ObjectDecorator } from "../util";
import { Manifest } from "./deployment-model";
import { FeatureData } from "../portal-manager";

export class ManifestDecorator {
    // static

    static FeatureDecorator = new ObjectDecorator()
        .defaultValueFunction("label", (object : any) => object.name)
        .defaultValue("description", "")
        .defaultValue("tags", [])
        .defaultValue("enabled", true)
        .defaultValue("permissions", [])
        .defaultValue("categories", [])
        .defaultValue("visibility", [])
        .defaultValue("featureToggles", [])

    static decorate(manifest : Manifest) : Manifest {
        let decorateFeature = (feature : FeatureData) => {
            ManifestDecorator.FeatureDecorator.decorate(feature)

            if (feature.children)
                for (let child of feature.children)
                    decorateFeature(child)
        }

        for (let feature of manifest.features) {
            decorateFeature(feature)
        }

        return manifest
    }
}
