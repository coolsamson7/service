import { Inject, Injectable, Injector } from "@angular/core";

import {LoadChildrenCallback, Route, Router, Routes} from "@angular/router";
import {loadRemoteModule, setRemoteDefinitions} from "@nrwl/angular/mf";
import {PortalModuleConfig, PortalModuleConfigToken} from "./portal.module";
import {FeatureRegistry} from "./feature-registry";
import {Deployment} from "./deployment/deployment-model";
import {ModuleRegistry} from "./modules";
import {FeatureConfig} from "./feature-config";
import { DeploymentLoader, HTTPDeploymentLoader, LocalDeploymentLoader, ManifestDecorator } from "./deployment";
import {TraceLevel, Tracer} from "./tracer";

/**
 * the runtime data of feature
 */
export interface FeatureData extends FeatureConfig {
  // computed after resolving parent links

  children? : FeatureConfig[]
  $parent? : FeatureConfig

  // computed

  enabled?: boolean
  module? : any
  origin? : string
  routerPath?: string
  path? : string

  ngComponent? : any
  load? : LoadChildrenCallback
}

@Injectable({providedIn: 'root'})
export class PortalManager {
    // static

    static instance : PortalManager

  // instance data

  deployment : Deployment = {
      modules: {}
  }

  loadedModules: {[key: string] : boolean} = {}
  routes: {[path: string] : Route} = {}

  // constructor

    constructor(
        @Inject(PortalModuleConfigToken) private portalConfig : PortalModuleConfig,
        private featureRegistry : FeatureRegistry,
        private moduleRegistry : ModuleRegistry,
        private router : Router,
        private injector: Injector
    ) {
        PortalManager.instance = this
    }

    static registerLazyRoutes(feature : string, routes : Routes) : Routes {
        PortalManager.instance.registerLazyRoutes(feature, routes)

        return routes
    }

    loadDeployment(reset = false) : Promise<void> {
      let loader : DeploymentLoader

      if ( this.portalConfig.loader.server)
         loader = this.injector.get(HTTPDeploymentLoader)
      else
         loader = new LocalDeploymentLoader(...this.portalConfig.loader.remotes!!)

        return loader
            .load()
            .then((deployment) => this.setupDeployment(deployment, reset))
    }

    // private

    private registerLazyRoutes(feature : string, routes : Routes) {
        if (Tracer.ENABLED)
            Tracer.Trace("portal", TraceLevel.FULL, "register lazy routes for {0}", feature)

        // local functions

        let rootFeature = this.featureRegistry.getFeature(feature)
        let rootRoute = routes.find(route => route.redirectTo == undefined)

        // we just loaded it, so set it to undefined

        rootFeature.load = undefined

        this.link(rootRoute!!, rootFeature)

        this.linkRoutes(routes.filter(route => route !== rootRoute && route.redirectTo == undefined), rootFeature.children || [])
    }

    private decorateRoute(route : Route) {
        if (this.portalConfig.decorateRoutes)
            this.portalConfig.decorateRoutes(route)
    }

    private link(route : Route, feature : FeatureData) {
      if ( route.data == undefined) {
        // let the portal do some stuff

        this.decorateRoute(route)

        // set  feature as data

        route.data = {
          feature: feature
        }

        // remember component

        if (route.component) {
          feature.ngComponent = route.component

          let componentType : any = route.component

          componentType['$$feature'] = feature
        }

        // remember load function

        if (route.loadChildren) {
          feature.load = route.loadChildren
          if (!feature.origin)
            feature.origin = feature.module.name
        }
      }
      else console.log("route already linked")
    }

    private linkRoutes(routes : Routes, features : FeatureData[]) {
      // local functions

      let featureRoute = (feature: FeatureConfig) => {
        return feature.router?.path ? feature.router.path : feature.id
      }

      let findFeature4 = (route: string) => {
        return features.find(feature => featureRoute(feature) == route)
      }

      // go

        let index = 0
        while (index < routes.length) {
            let route = routes[index++]

            if (!route.redirectTo) { // leave redirects
                let feature = findFeature4(route.path!!)

                if ( feature) {
                  this.link(route, feature)

                  // recursion

                  if (route.children && route.children.length > 0)
                    this.linkRoutes(route.children, feature.children!!)
                }
                else {
                  throw new Error("did not find feature for path " + route.path!!)
                  //TODO routes.splice(--index, 1)
                }
            } // if
        } // while
    }

    private buildRoutes(deployment : Deployment, localRoutes : Routes, merge: boolean) : Routes {
        if (Tracer.ENABLED)
            Tracer.Trace("portal", TraceLevel.FULL, "build routes")

        const modules = deployment.modules

        // construct lazy routes

        const lazyRoutes : Routes = Object.values(modules)
            .filter(module => module.remoteEntry !== undefined)
            .map(module => {
              const key = module.name
              const feature = this.featureRegistry.getFeature(key)

              let route = this.routes[key]

              if (!route) {
                route  = {
                  path: key
                }

                // TODO: brauchen wir das?????

              if (!this.loadedModules[key])
                route.loadChildren = () => loadRemoteModule(key, './Module')
                  .then((m) => {
                    this.loadedModules[key] = true

                    return m[module.module.ngModule]
                  })

              feature.origin = module.remoteEntry

              this.link(route, feature)

                // remember

                this.routes[key] = route
            } // if

                return route
            });

        if ( !merge ) {
          // patch local routes

          let localModule = Object.values(modules).find(module => module.remoteEntry == undefined)
          let localFeatures = localModule!!.features

          this.linkRoutes(localRoutes, localFeatures)
        }

        let routes = [...localRoutes, ...lazyRoutes]

        ;(window as any)["routes"] = () => {
        console.log(routes)
      }

      console.log(routes)

        // done

        return routes
    }

    private mergeFeatureRegistry(deployment : Deployment) { // TODO
      for (let module in deployment.modules) {
        let manifest = deployment.modules[module]
      }
    }

    private fillFeatureRegistry(deployment : Deployment) {
        for (let module in deployment.modules) {
            let manifest = deployment.modules[module]

          let prevManifest = this.deployment.modules[module]
          if ( prevManifest) {

            // forget about local features, since they never change

            if ( manifest.type == "microfrontend") {
              // copy manifest

              //TODO ???? prevManifest.enabled = manifest.enabled

              // we need to merge ( e.g. the enabled status )


              let rootFeature: FeatureData =  manifest.features.find(feature => feature.id == "")!!
              // append the rest as children
              rootFeature.children = manifest.features.filter(feature => feature.id != "")!!

              this.featureRegistry.mergeFeature(this.featureRegistry.getFeature(manifest.name), rootFeature)
            }
          }
          else {
            if (manifest.type == "microfrontend")
              this.featureRegistry.registerRemote(manifest.name, ...manifest.features)
            else
              this.featureRegistry.register(...manifest.features)

            // remember

            this.deployment.modules[module] = manifest
          }
        }

        this.featureRegistry.ready()
    }

    // public

    private setupDeployment(deployment : Deployment, reset: boolean) {
        ;(window as any)["deployment"] = () => {
            console.log(deployment)
        }

        // possibly reset feature registry

        //if ( reset )
        //    this.featureRegistry.reset()

        // add local manifest

        let localManifest = ManifestDecorator.decorate(this.portalConfig.localManifest)

        localManifest.type = "shell"
        localManifest.isLoaded = true

        deployment.modules[localManifest.module.name] = localManifest

        // set remote definitions

        let remotes : any = {}

        for (let moduleName in deployment.modules) {
            let module = ManifestDecorator.decorate(deployment.modules[moduleName])

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

        this.router.resetConfig(this.buildRoutes(deployment, this.portalConfig.localRoutes, reset))
    }
}
