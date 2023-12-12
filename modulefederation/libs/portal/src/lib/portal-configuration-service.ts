import {Inject, Injectable} from "@angular/core";

import {Route, Router, Routes} from "@angular/router";
import {loadRemoteModule, setRemoteDefinitions} from "@nrwl/angular/mf";
import {PortalModuleConfig, PortalModuleConfigToken} from "./portal.module";
import { FeatureRegistry } from "./feature-registry";
import {DeploymentConfig} from "./deployment/deployment-model";
import {ModuleRegistry} from "./modules";
import {FeatureConfig} from "./feature-config";

@Injectable({ providedIn: 'root' })
export class PortalConfigurationService {
  // static

  static instance : PortalConfigurationService

  static registerLazyRoutes(feature: string, routes: Routes) : Routes {
    PortalConfigurationService.instance.registerLazyRoutes(feature, routes)

    return routes
  }

  private registerLazyRoutes(feature: string, routes: Routes) {
    // local functions

    let rootFeature = this.featureRegistry.getFeature(feature)
    let rootRoute = routes.find(route => route.redirectTo == undefined )

    // we just loaded it, so set it to undefined

    rootFeature.load = undefined

    this.link(rootRoute!!, rootFeature)

    this.linkRoutes(routes.filter(route => route !== rootRoute && route.redirectTo == undefined), rootFeature.children || [])
  }

  // constructor

  constructor(
    @Inject(PortalModuleConfigToken) private portalConfig: PortalModuleConfig,
    private featureRegistry : FeatureRegistry,
    private moduleRegistry: ModuleRegistry,
    private router : Router
  ) {
    PortalConfigurationService.instance = this
  }

  // private

  private decorateRoute(route: Route) {
    if (this.portalConfig.decorateRoutes)
      this.portalConfig.decorateRoutes(route)
  }

  private link(route: Route, feature: FeatureConfig) {
    // let the portal do some stuff

    this.decorateRoute(route)

    // set  feature as data

    route.data = {
      feature: feature
    }

    // remember component

    if ( route.component ) {
      feature.ngComponent = route.component

      let componentType : any =  route.component

      componentType['$$feature'] = feature
    }

    // remember load function

    if ( route.loadChildren )
      feature.load = route.loadChildren
  }

  private linkRoutes(routes: Routes, features: FeatureConfig[]) {
    let index = 0
    for (let route of routes) {
      if ( !route.redirectTo ) {
        let feature = features[index]

        this.link(route, feature)

        // recursion

        if ( route.children && route.children.length > 0)
          this.linkRoutes(route.children, feature.children!!)

        // next

        index++
      }
    }
  }


  private buildRoutes(deployment: DeploymentConfig, localRoutes: Routes) : Routes {
    const modules = deployment.modules

    // construct lazy routes

    const lazyRoutes: Routes = Object.values(modules)
      .filter(module => module.remoteEntry !== undefined )
      .map(module => {
        const key = module.name
        const feature =  this.featureRegistry.getFeature(key)

        let route =  {
          path: key,
          loadChildren: () => loadRemoteModule(key, './Module')
            .then((m) => m[module.module.ngModule]),
        }

        this.link(route, feature)

        return route
      });

    // patch local routes

    let localModule = Object.values(modules).find(module => module.remoteEntry == undefined )
    let localFeatures = localModule!!.features

    this.linkRoutes(localRoutes, localFeatures)

    // done

    return [...localRoutes, ...lazyRoutes]
  }

  private fillFeatureRegistry(deployment: DeploymentConfig) {
    for ( let module in deployment.modules) {
      let manifest = deployment.modules[module]

      if ( manifest.type == "microfrontend")
        this.featureRegistry.registerRemote(manifest.name, ...manifest.features)
      else
        this.featureRegistry.register(...manifest.features)
    }

    this.featureRegistry.ready()
  }

  private setupDeployment(deployment: DeploymentConfig) {
    ;(window as any)["deployment"] = () => {
      console.log(deployment)
    }

    // add local manifest

    let localModule =  this.portalConfig.localManifest

    localModule.type = "shell"
    localModule.isLoaded = true

    deployment.modules[localModule.module.name] = localModule

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
