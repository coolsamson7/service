import { Injectable } from "@angular/core";
import { filter, map, Observable, ReplaySubject, take, tap } from "rxjs";
import {FeatureConfig} from "./feature-config";

@Injectable({ providedIn: 'root' })
export class FeatureRegistry {
  // instance data

  features : {[name: string] : FeatureConfig } = {};
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

    for ( let key in this.features)
      table.push( {
          name: key,
          loadFunction: this.features[key].load != undefined ? "(...)" : "",
          component: this.features[key].component,
          loaded: this.features[key].ngComponent !== undefined
        })

    console.table(table)
  }

  ready() {
    this.registry$.next(this);
  }

  private registerFeature(feature: FeatureConfig, parent?: FeatureConfig, path = "") {
    // local function

    let key = (name: string, path: string) => {
      if ( path.length == 0)
        return name
      else
        return path + name
    }

    // go

    this.features[key(feature.name, path)] = feature

    // link

    if (parent ) {
      if ( parent.children == undefined)
        parent.children = [feature]
      else
        parent.children.push(feature)

      feature.$parent = parent
    }

    // recursion

    for ( let child of feature.children || [])
        this.registerFeature(child, feature, (path == "" ? feature.name : path + "." + feature.name) + ".");
  }

  register(...features: FeatureConfig[]) {
    for ( let feature of features)
      if (!feature.$parent)
        this.registerFeature(feature, undefined, "")
  }

  registerRemote(microfrontend: string,...features: FeatureConfig[]) {
    let rootFeature = features.find(feature => feature.name == "")
    if ( rootFeature )
      this.registerFeature(rootFeature, undefined, microfrontend)

    for ( let feature of features)
      if (feature !== rootFeature && !feature.$parent)
        this.registerFeature(feature, rootFeature, microfrontend + ".")
  }

  getFeature(id: string) : FeatureConfig {
    return this.features[id]
  }
}
