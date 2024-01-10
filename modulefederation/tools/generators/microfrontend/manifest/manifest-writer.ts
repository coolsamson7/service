import { ProjectConfiguration, Tree } from "@nrwl/devkit";


type Action = (object : any) => void
type Compute = (object : any) => any

export class Class {
    // instance data

    properties : { [name : string] : Action } = {}

    // constructor

    constructor() {
    }

    // public

    public clean(object : any) {
        for (let property in this.properties)
            this.properties[property](object)
    }

    // fluent

    compute(name : string, compute : Compute) : Class {
        this.properties[name] = (obj) => obj[name] = compute(obj)

        return this
    }

    optional(name : string, defaultValue : any) : Class {
        const equalArrays = (a, b) =>
            a == undefined || b == undefined ?
                a == b :
                a.length === b.length && a.every((element, index) => element == b[index]);

        const equal = (a, b) => a == b

        if (Array.isArray(defaultValue))
            this.properties[name] = (object : any) => {
                if (equalArrays(object[name], defaultValue))
                    delete object[name]
            }
        else
            this.properties[name] = (object : any) => {
                if (equal(object[name], defaultValue))
                    delete object[name]
            }

        return this
    }

    remove(name : string) : Class {
        this.properties[name] = (object : any) => {
            delete object[name]
        }

        return this
    }

    // public
}

export class ManifestWriter {
    // static

    static ModuleClass = new Class()
        //.required("ngModule")
        .remove("file")
        .remove("relative")

    static FeatureClass = new Class()
        .compute("module", (obj) => obj.module?.name)
        //.required("component")
        .optional("router", null)
        .optional("label", "")
        .optional("labelKey", "")
        .optional("folder", "")
        .optional("icon", "")
        .optional("i18n", [])
        .optional("permissions", [])
        .optional("tags", [])
        .optional("categories", [])
        .optional("visibility", [])
        .optional("featureToggles", [])
        .remove("relative")
        .remove("fqn")
        .remove("file")

    // constructor

    constructor(private project : ProjectConfiguration) {
    }

    // public

    async write(host : Tree, manifest : any) {
        this.clean(manifest)

        const filename = this.project.sourceRoot + "/assets/manifest.json"

        host.write(filename, JSON.stringify(manifest, null, 2))
    }

    // private

    private clean(manifest : any) {
        // module

        //ManifestWriter.ModuleClass.clean(manifest.module)

        manifest.module = manifest.module.ngModule

        // features

        let cleanFeature = (feature) => {
            ManifestWriter.FeatureClass.clean(feature)

            if (feature.children)
                for (let child of feature.children)
                    cleanFeature(child)
        }

        for (let feature of manifest.features)
            cleanFeature(feature)
    }
}
