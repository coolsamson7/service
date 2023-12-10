import {Inject, Injectable} from "@angular/core";

import {Router, Routes} from "@angular/router";
import {loadRemoteModule, setRemoteDefinitions} from "@nrwl/angular/mf";
import {PortalModuleConfig, PortalModuleConfigToken} from "./portal.module";
import { FeatureRegistry } from "./feature-registry";
import { DeploymentConfig } from "./deployment";

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

    return [...localRoutes, ...lazyRoutes]
  }

  private fillFeatureRegistry(deployment: DeploymentConfig) {
    for ( let module in deployment.modules) {
      let manifest = deployment.modules[module]

      // TODO: names, etc.

      this.featureRegistry.register(...manifest.features)
    }
  }

  private setupDeployment(deployment: DeploymentConfig) {
    // add local manifest

    deployment.modules[this.portalConfig.localManifest.module.name] = this.portalConfig.localManifest

    // set remote definitions

    setRemoteDefinitions(deployment.remotes)

    // fill feature registry

    this.fillFeatureRegistry(deployment)

    // setup routes

    this.router.resetConfig(this.buildRoutes(deployment, this.portalConfig.localRoutes))
  }

  // public

  async load(): Promise<void> {
    this.portalConfig.loader.load()
      .then((deployment) => this.setupDeployment(deployment))
  }
}
