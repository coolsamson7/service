import {ProjectConfiguration, Tree} from "@nrwl/devkit";


type Action = (object: any) => void
export class Class {
  // instance data

  properties: {[name: string] : Action} = {}

  // constructor

  constructor() {}

  // public

  public clean(object: any) {
    for ( let property in this.properties)
      this.properties[property](object)
  }

  // fluent

  required(name: string) : Class {
    //this.properties[name] = defaultValue

    return this
  }

  optional(name: string, defaultValue: any) : Class {
    const equalArrays = (a, b) =>
      a == undefined || b == undefined ?
         a == b :
         a.length === b.length && a.every((element, index) => element == b[index]);

    const equal = (a, b) => a == b

    if (Array.isArray(defaultValue))
      this.properties[name] = (object: any) => {
        if (equalArrays(object[name], defaultValue))
          delete object[name]
      }
      else
        this.properties[name] = (object: any) => {
        if (equal(object[name], defaultValue))
          delete object[name]
      }

    return this
  }

  remove(name: string) : Class {
    this.properties[name] = (object: any) => {
      delete object[name]
    }

    return this
  }

  // public
}
export class ManifestWriter {
  // static

  static ModuleClass = new Class()
    .required("name")
    .required("ngModule")
    //.remove("file")
    .remove("relative")

  static FeatureClass = new Class()
    .required("name")
    .required("component")
    .optional("router", "") // ?
    .optional("label", "")
    .optional("permissions", [])
    .optional("tags", [])
    .optional("categories", [])
    .optional("visibility", [])
    .optional("featureToggles", [])
    .remove("relative")
    .remove("file")

  // constructor

  constructor(private project: ProjectConfiguration) {
  }

  // public

  async write(host: Tree, manifest: any) {
    this.clean(manifest)

    const filename = this.project.sourceRoot + "/assets/manifest.json"

    host.write(filename, JSON.stringify(manifest, null, 2))
  }

  // private

  private clean(manifest: any) {
    // module

    ManifestWriter.ModuleClass.clean(manifest.module)

    // features

    for ( let feature of manifest.features) {
      ManifestWriter.FeatureClass.clean(feature)
      if ( feature.module )
        ManifestWriter.ModuleClass.clean(feature.module)
    }
  }
}
