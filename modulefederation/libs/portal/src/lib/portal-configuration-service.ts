import {Inject, Injectable} from "@angular/core";

import {Router, Routes} from "@angular/router";
import {loadRemoteModule, setRemoteDefinitions} from "@nrwl/angular/mf";
import {PortalModuleConfig, PortalModuleConfigToken} from "./portal.module";
import { FeatureRegistry } from "./feature-registry";
import {DeploymentConfig} from "./deployment/deployment-model";
import {ModuleRegistry} from "./modules";

@Injectable({ providedIn: 'root' })
export class PortalConfigurationService {
  // constructor

  constructor(
    @Inject(PortalModuleConfigToken) private portalConfig: PortalModuleConfig,
    private featureRegistry : FeatureRegistry,
    private moduleRegistry: ModuleRegistry,
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

    this.featureRegistry.ready()
  }

  private setupDeployment(deployment: DeploymentConfig) {
    ;(window as any)["deployment"] = () => {
      console.log(deployment)
    }

    // add local manifest

    this.portalConfig.localManifest.type = "shell"

    deployment.modules[this.portalConfig.localManifest.module.name] = this.portalConfig.localManifest

    // set remote definitions

    let remotes : any = {}

    for (let moduleName in deployment.modules) {
      let module = deployment.modules[moduleName]

      module.isLoaded = false

      this.moduleRegistry.register(module)

      if (module.remoteEntry) {
        module.type = "microfrontend"

        remotes[moduleName] = module.remoteEntry
      }
      else {
        module.isLoaded = true
      }
  }

    setRemoteDefinitions(remotes)

    // fill feature registry

    this.fillFeatureRegistry(deployment)

    // setup routes

    this.router.resetConfig(this.buildRoutes(deployment, this.portalConfig.localRoutes))
  }

  // public

  load(): Promise<void> {
    return this.portalConfig.loader
      .load()
      .then((deployment) => this.setupDeployment(deployment))
  }
}
