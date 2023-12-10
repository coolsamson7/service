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
  }

  // public

  register(...features: FeatureConfig[]) {
    // register

    for ( let feature of features)
        this.features[feature.name] = feature

    // call subscribers

    this.registry$.next(this);
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
