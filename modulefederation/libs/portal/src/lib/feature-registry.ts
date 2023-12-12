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
    console.table(Object.values(this.features))
  }

  ready() {
    this.registry$.next(this);
  }

  register(...features: FeatureConfig[]) {
    // local function

    let key = (name: string, path: string) => {
      if ( path.length == 0)
        return name
      else
        return path + name
    }

    let register = (feature: FeatureConfig, parent?: FeatureConfig, path = "") => {
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

      for ( let child of feature.children || []) {
        register(child, feature, (path == "" ? feature.name : path + "." + feature.name) + ".");
      }
    }

    // start with top level features

    for ( let feature of features)
      if (!feature.$parent)
        register(feature, undefined, "")
  }

  registerRemote(microfrontend: string,...features: FeatureConfig[]) {
    // local function

    let key = (name: string, path: string) => {
      if ( path.length == 0)
        return name
      else
        return path + name
    }

    let register = (feature: FeatureConfig, parent?: FeatureConfig, path = "") => {
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
        register(child, feature, (path == "" ? feature.name : path + "." + feature.name) + ".");
    }

    let rootFeature = features.find(feature => feature.name == "")
    if ( rootFeature )
      register(rootFeature, undefined, microfrontend)

    for ( let feature of features)
      if (feature !== rootFeature && !feature.$parent)
        register(feature, rootFeature, microfrontend + ".")
  }

  getFeature(id: string) : FeatureConfig {
    return this.features[id]
  }

  getFeatureComponent$(id: string): Observable<any> {
    // TODO. feature.load + auf undefined setzen
    return this.registry$.pipe(
      map((registry) => registry.getFeature(id)),
      tap((feature) => {if ( !feature.ngComponent ) feature.load?.()}),
      filter((feature) => !!feature?.ngComponent),
      map((feature) => feature.ngComponent),
      take(1)
    );
  }
}
