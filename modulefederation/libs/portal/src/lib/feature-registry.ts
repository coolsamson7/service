import { Injectable } from "@angular/core";
import { filter, map, Observable, ReplaySubject, take, tap } from "rxjs";
import { Router } from "@angular/router";
import { FeatureConfig } from "./portal-decorators";

// obsolete?
interface FeatureMetaData extends FeatureConfig {
  ngComponent: any
  load?: () => Observable<any>
}

@Injectable({ providedIn: 'root' })
export class FeatureRegistry {
  // instance data

  features : {[name: string] : FeatureConfig } = {};

  registry$ = new ReplaySubject<FeatureRegistry>(1);

  // constructor

  constructor(private router : Router) {
    this.importDeployment()
  }

  /*
  const modules = this.config.modules
  const lazyRoutes: Routes = Object.keys(modules).map(key => {
    const module = modules[key];

    return {
      path: key,
      loadChildren: () => loadRemoteModule(key, './Module')
        .then((m) => m[module.module.ngModule]) //
    }
  });
  */
  importDeployment() {
    //Deployment.instance.buildRoutes()
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
