import { Injectable } from "@angular/core";
import { filter, map, Observable, ReplaySubject, take, tap } from "rxjs";
import {FeatureConfig} from "./feature-config";
import {FeatureData} from "./portal-manager";

@Injectable({ providedIn: 'root' })
export class FeatureRegistry {
  // instance data

  features : {[name: string] : FeatureData } = {};
  registry$ = new ReplaySubject<FeatureRegistry>(1);

  // constructor

  constructor() {
    ;(window as any)["features"] = () => {
      this.report()
    }
  }

  // public

    report() {
        let table = []

        for ( let path in this.features) {
            let feature = this.features[path]

            table.push( {
                name: path,
                component: feature.component,
                origin: feature.origin,
                loaded: feature.ngComponent !== undefined ? "x" : null
            })
        }

        console.table(table)
    }

  ready() {
    this.registry$.next(this);
  }

  private registerFeature(featureConfig: FeatureConfig, parent?: FeatureData, path = "") {
    // local function

    let key = (name: string, path: string) => {
      if ( path.length == 0)
        return name
      else
        return path + name
    }

    let feature = featureConfig as FeatureData

    // add

    let name = key(feature.id, path)

    this.features[name] = feature

    feature.path = name.replace(".", "/")

    // link parent & child

    if (parent ) {
      if ( parent.children == undefined)
        parent.children = [feature]
      else
        parent.children.push(feature)

      feature.$parent = parent
    }

    // recursion

    for ( let child of feature.children || [])
        this.registerFeature(child, feature, (path == "" ? feature.id : path + "." + feature.id) + ".");
  }

  register(...features: FeatureConfig[]) {
    for ( let feature of features)
      if (!(feature as FeatureData).$parent)
        this.registerFeature(feature, undefined, "")
  }

  registerRemote(microfrontend: string,...features: FeatureConfig[]) {
    let rootFeature = features.find(feature => feature.id == "")
    if ( rootFeature )
      this.registerFeature(rootFeature, undefined, microfrontend)

    for ( let feature of features)
      if (feature !== rootFeature && !(feature as FeatureData).$parent)
        this.registerFeature(feature, rootFeature, microfrontend + ".")
  }

  // public

  getFeature(id: string) : FeatureData {
    return this.features[id]
  }

  findFeatures(filter: (feature: FeatureConfig) => boolean) : FeatureData[] {
    return Object.values(this.features).filter(filter)
  }
}
