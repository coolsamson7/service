import {Inject, Injectable} from "@angular/core";

import {Router, Routes} from "@angular/router";
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

  static registerMicrofrontendRoutes(mfe: string, routes: Routes) : Routes {
    PortalConfigurationService.instance.handleMicrofrontendRoutes(mfe, routes)

    return routes
  }

  static registerLazyRoutes(feature: string, routes: Routes) : Routes {
    // TODO
    PortalConfigurationService.instance.handleLazyRoutes(feature, routes)

    return routes
  }

  private handleLazyRoutes(mfe: string, routes: Routes) {
    let linkRoutes = (routes: Routes, features: FeatureConfig[]) => {
      let index = 0
      for (let route of routes) {
        if ( !route.redirectTo ) {
          route.data = {
            feature: features[index]
          }

          // recursion

          if ( route.children && route.children.length > 0)
            linkRoutes(route.children, features[index].children!!)

          // decorate

          if ( this.portalConfig.decorateRoutes)
            this.portalConfig.decorateRoutes(route)

          // next

          index++
        }
      }
    }

    let rootFeature = this.featureRegistry.getFeature(mfe)
    let rootRoute = routes.find(route => route.redirectTo == undefined )

    if ( this.portalConfig.decorateRoutes)
      this.portalConfig.decorateRoutes(rootRoute!!)

    rootRoute!!.data = {
      feature: rootFeature
    }

    //linkRoutes(routes.filter(route => route !== rootRoute && route.redirectTo !== undefined), rootFeature.children || [])
  }

  private handleMicrofrontendRoutes(mfe: string, routes: Routes) {
    let linkRoutes = (routes: Routes, features: FeatureConfig[]) => {
      let index = 0
      for (let route of routes) {
        if ( !route.redirectTo ) {
          route.data = {
            feature: features[index]
          }

          if ( route.loadChildren)
            route.data['feature'].load = route.loadChildren

          // recursion

          if ( route.children && route.children.length > 0)
            linkRoutes(route.children, features[index].children!!)

          // decorate

          if ( this.portalConfig.decorateRoutes)
            this.portalConfig.decorateRoutes(route)


          // next

          index++
        }
      }
    }

    let rootFeature = this.featureRegistry.getFeature(mfe)
    let rootRoute = routes.find(route => route.redirectTo == undefined )

    if ( this.portalConfig.decorateRoutes)
      this.portalConfig.decorateRoutes(rootRoute!!)

    rootRoute!!.data = {
      feature: rootFeature
    }

    linkRoutes(routes.filter(route => route !== rootRoute && route.redirectTo !== undefined), rootFeature.children || [])
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
          data: {
            feature:feature
          }
        }

        feature.load = route.loadChildren

        if ( this.portalConfig.decorateRoutes)
          this.portalConfig.decorateRoutes(route)

        return route
      });

    // patch local routes

    let localModule = Object.values(modules).find(module => module.remoteEntry == undefined )
    let localFeatures = localModule!!.features

    let linkRoutes = (routes: Routes, features: FeatureConfig[]) => {
      let index = 0
      for (let route of routes) {
        if ( !route.redirectTo ) {
          route.data = {
            feature: features[index]
          }

          if ( route.loadChildren)
            route.data['feature'].load = route.loadChildren

          // recursion

          if ( route.children && route.children.length > 0)
            linkRoutes(route.children, features[index].children!!)

          // decorate

          if ( this.portalConfig.decorateRoutes)
            this.portalConfig.decorateRoutes(route)

          // next

          index++
        }
      }
    }

    linkRoutes(localRoutes, localFeatures)

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
