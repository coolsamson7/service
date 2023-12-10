import {Inject, Injectable} from "@angular/core";

import {Router, Routes} from "@angular/router";
import {loadRemoteModule, setRemoteDefinitions} from "@nrwl/angular/mf";
import {PortalModuleConfig, PortalModuleConfigToken} from "./portal.module";
import { FeatureRegistry } from "./feature-registry";
import {DeploymentConfig} from "./deployment/deployment-model";

@Injectable({ providedIn: 'root' })
export class PortalConfigurationService {
  // constructor

  constructor(
    @Inject(PortalModuleConfigToken) private portalConfig: PortalModuleConfig,
    private featureRegistry : FeatureRegistry,
    private router : Router
  ) {
  }

  // private

  private buildRoutes(deployment: DeploymentConfig, localRoutes: Routes) : Routes {
    const modules = deployment.modules
    const lazyRoutes: Routes = Object.keys(modules).map(key => {
      const module = modules[key];

      return {
        path: key,
        loadChildren: () => loadRemoteModule(key, './Module')
          .then((m) => m[module.module.ngModule]) //
      }
    });

    console.log([...localRoutes, ...lazyRoutes])

    return [...localRoutes, ...lazyRoutes]
  }

  private fillFeatureRegistry(deployment: DeploymentConfig) {
    for ( let module in deployment.modules) {
      let manifest = deployment.modules[module]

      // TODO: names, etc.

      this.featureRegistry.register(...manifest.features)
    }

    this.featureRegistry.ready()
  }

  private setupDeployment(deployment: DeploymentConfig) {
    ;(window as any)["deployment"] = () => {
      console.log(deployment)
    }

    // add local manifest

    deployment.modules[this.portalConfig.localManifest.module.name] = this.portalConfig.localManifest

    // set remote definitions

    setRemoteDefinitions(deployment.remotes)

    // fill feature registry

    this.fillFeatureRegistry(deployment)

    // setup routes

    console.log("reset routes ")

    this.router.resetConfig(this.buildRoutes(deployment, this.portalConfig.localRoutes))
  }

  // public

  load(): Promise<void> {
    console.log("load")
    return this.portalConfig.loader
      .load()
      .then((deployment) => this.setupDeployment(deployment))
  }
}
