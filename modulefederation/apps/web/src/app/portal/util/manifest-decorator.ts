import { ObjectDecorator } from "./object-decorator"
import { FeatureData, Manifest } from "@modulefederation/portal";

export class ManifestDecorator {
    // static

    static FeatureDecorator = new ObjectDecorator()
        .defaultValueFunction("label", (object : any) => object.name)
        .defaultValue("description", "")
        .defaultValue("enabled", true)
        .defaultValue("tags", [])
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

        // manifest

        if (!Object.hasOwn(manifest, "enabled"))
            manifest.enabled = true

        // features

        for (let feature of manifest.features) {
            decorateFeature(feature)
        }

        return manifest
    }
}
