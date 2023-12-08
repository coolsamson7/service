import { loadRemoteModule, setRemoteDefinitions} from '@nrwl/angular/mf';

import { Routes } from "@angular/router";
import {Manifest} from "./manifest";

export class Deployment {
  // static data

  static instance : Deployment

  // instance data

  private localRoutes: Routes = []

  constructor(private config: DeploymentConfig) {
    Deployment.instance = this
  }

  // public

  buildRoutes(localRoutes: Routes) : Routes {
    const modules = this.config.modules
    const lazyRoutes: Routes = Object.keys(modules).map(key => {
     const entry = modules[key];

      /*path: 'second-microfront',
        loadChildren: () =>
        loadRemoteModule('second-microfront', './Module').then(
          (m) => m.RemoteEntryModule
        ),*/

     return {
       path: key,
       loadChildren: () => loadRemoteModule(key, './Module')
         .then((m) => m[entry.module.ngModule])
     }
   });

    return [...localRoutes, ...lazyRoutes]
  }

  setLocalRoutes(localRoutes: Routes){
    this.localRoutes = localRoutes
  }

  setRemoteDefinitions(){
    setRemoteDefinitions(this.config.remotes)
  }
}
export interface DeploymentConfig {
  name: string
  remotes: { [name: string] : string } // name -> url
  modules: { [name: string] : Manifest }
}

export interface DeploymentLoader {
  load() : Promise<Deployment>
}

export class LocalDeploymentLoader implements DeploymentLoader {
  // instance data

  private urls: string[]

  // constructor

  constructor(...urls: string[]) {
    this.urls = urls
  }
  // implement DeploymentLoader
  async load() : Promise<Deployment> {
    const promises = this.urls.map(url => {
      return fetch(url + "/assets/manifest.json")
    })

    let result: DeploymentConfig = {
      name: "deployment",
      remotes: {},
      modules: {}
    }

    let responses = await Promise.allSettled<Response>(promises)
    let index = 0
    for ( let response of responses) {
      if (response.status == "fulfilled") {
        let json = await response.value.json()

        result.remotes[json.module.name] = this.urls[index]
        result.modules[json.module.name] = json
      }
      else {
        console.log("error fetching " + this.urls[index] + "/assets/manifest.json, reason: " + response.reason)
      }

      index++;
    }

    return new Deployment(result)
  }
}
