import { Injectable } from "@angular/core";
import { ReplaySubject } from "rxjs";
import { FeatureConfig, Visibility } from "./feature-config";
import { FeatureData } from "./portal-manager";

export type FeatureFilter = (feature : FeatureData) => boolean

@Injectable({providedIn: 'root'})
export class FeatureRegistry {
  // instance data

  features : { [name : string] : FeatureData } = {};
  registry$ = new ReplaySubject<FeatureRegistry>(1);

  // constructor

  constructor() {
    ;(window as any)["features"] = () => {
      this.report()
      console.log(this.features)
    }
  }

  // public

  report() {
    let table = []

    for (let path in this.features) {
      let feature = this.features[path]

      table.push({
        name: path,
        component: feature.component,
        origin: feature.origin,
        enabled: feature.enabled ? "x" : null,
        loaded: feature.ngComponent !== undefined ? "x" : null
      })
    }

    console.table(table)
  }

  ready() {
    this.registry$.next(this);
  }

  register(...features : FeatureConfig[]) {
    for (let feature of features)
      if (!(feature as FeatureData).$parent)
        this.registerFeature(feature, undefined, "")
  }

  registerRemote(microfrontend : string, ...features : FeatureConfig[]) {
    let rootFeature = features.find(feature => feature.id == "")
    if (rootFeature)
      this.registerFeature(rootFeature, undefined, microfrontend)

    for (let feature of features)
      if (feature !== rootFeature && !(feature as FeatureData).$parent)
        this.registerFeature(feature, rootFeature, microfrontend + ".")
  }

  disable(microfrontend : string) {
    let rootFeature = this.getFeature(microfrontend)

    let disable = (feature : FeatureData) => {
      feature.enabled = false

      if (feature.children)
        for (let child of feature.children)
          disable(child)
    }

    disable(rootFeature)
  }

  getFeature(id : string) : FeatureData {
    let feature = this.features[id]

    if (!feature)
      throw new Error(`unknown feature ${id}`)

    return feature
  }

  findFeature(id : string) : FeatureData | undefined {
    return this.features[id]
  }


  // public

  findFeatures(filter : (feature : FeatureConfig) => boolean) : FeatureData[] {
    return Object.values(this.features).filter(filter)
  }

  finder() : FeatureFinder {
    return new FeatureFinder(this)
  }

  mergeFeature(feature : FeatureData, newFeature : FeatureData) {
    // copy

    feature.enabled = newFeature.enabled // TODO: is that it??

    // recursion

    if (feature.children)
      for (let child of feature.children)
        this.mergeFeature(child, newFeature.children?.find(f => f.id == child.id)!!)
  }

  private registerFeature(featureConfig : FeatureConfig, parent? : FeatureData, path = "") {
    // local function

    let key = (name : string, path : string) => {
      if (path.length == 0)
        return name
      else
        return path + name
    }

    let feature = featureConfig as FeatureData

    // add

    let name = key(feature.id, path)

    this.features[name] = feature

    feature.path = name
    feature.routerPath = "/" + name.replace(".", "/")

    // link parent & child

    if (parent) {
      if (parent.children == undefined)
        parent.children = [feature]
      else
        parent.children.push(feature)

      feature.$parent = parent
    }

    // recursion

    for (let child of feature.children || [])
      this.registerFeature(child, feature, (path == "" ? feature.id : path + "." + feature.id) + ".");
  }
}

export class FeatureFinder {
  // instance data

  private filters : FeatureFilter[] = []

  // constructor

  constructor(private featureRegistry : FeatureRegistry) {
    // automatic filter for enabled

    this.filters.push((feature) => feature.enabled == true)
  }

  // fluent

  withId(id : string) : FeatureFinder {
    this.filters.push((feature) => feature.id == id)
    return this
  }

  withVisibility(visibility : Visibility) : FeatureFinder {
    this.filters.push((feature) => feature.visibility!!.includes(visibility))
    return this
  }

  withTag(tag : string) : FeatureFinder {
    this.filters.push((feature) => feature.tags!!.includes(tag))
    return this
  }

  withEnabled(enabled = true) : FeatureFinder {
    this.filters.push((feature) => {
      if (feature.enabled !== null)
        return feature.enabled == enabled
      else
        return true
    })
    return this
  }

  withPermission(permission : string) : FeatureFinder {
    this.filters.push((feature) => feature.permissions!!.includes(permission))
    return this
  }

  withCategory(category : string) : FeatureFinder {
    this.filters.push((feature) => feature.categories!!.includes(category))
    return this
  }

  // public

  find() : FeatureData[] {
    return this.featureRegistry.findFeatures((feature) => {
      for (let filter of this.filters)
        if (!filter(feature))
          return false

      return true
    })
  }
}
