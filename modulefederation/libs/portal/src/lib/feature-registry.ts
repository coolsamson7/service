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
    for ( let feature of features)
        this.features[feature.name] = feature
  }

  getFeature(id: string) : FeatureConfig {
    return this.features[id]
  }

  getFeatureComponent$(id: string): Observable<any> {
    return this.registry$.pipe(
      map((registry) => registry.getFeature(id)),
      tap((feature) => {if ( !feature.ngComponent ) feature.load?.()}),
      filter((feature) => !!feature?.ngComponent),
      map((feature) => feature.ngComponent),
      take(1)
    );
  }
}
