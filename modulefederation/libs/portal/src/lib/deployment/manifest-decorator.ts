import { ObjectDecorator } from "../common/util";
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
        const decorateFeature = (feature : FeatureData) => {
            ManifestDecorator.FeatureDecorator.decorate(feature)

            if (feature.children)
                for (const child of feature.children)
                    decorateFeature(child)
        }

        for (const feature of manifest.features) {
            decorateFeature(feature)
        }

        return manifest
    }
}
