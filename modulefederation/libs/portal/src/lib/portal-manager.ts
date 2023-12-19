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
    // computed

    enabled?: boolean
    module? : any
    origin? : string
    routerPath?: string
    path? : string

    children? : FeatureConfig[]
    $parent? : FeatureConfig

    ngComponent? : any
    load? : LoadChildrenCallback
}

@Injectable({providedIn: 'root'})
export class PortalManager {
    // static

    static instance : PortalManager

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

    // constructor

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
            let route = routes[index]

            if (!route.redirectTo) { // leave redirects
                let feature = findFeature4(route.path!!)

                if ( feature) {
                  index++
                  this.link(route, feature)

                  // recursion

                  if (route.children && route.children.length > 0)
                    this.linkRoutes(route.children, feature.children!!)
                }
                else
                  routes.splice(index, 1)
            } // if
          else index++
        } // while
    }

    private buildRoutes(deployment : Deployment, localRoutes : Routes) : Routes {
        if (Tracer.ENABLED)
            Tracer.Trace("portal", TraceLevel.FULL, "build routes")

        const modules = deployment.modules

        // construct lazy routes

        const lazyRoutes : Routes = Object.values(modules)
            .filter(module => module.remoteEntry !== undefined)
            .map(module => {
                const key = module.name
                const feature = this.featureRegistry.getFeature(key)

                let route = {
                    path: key,
                    loadChildren: () => loadRemoteModule(key, './Module')
                        .then((m) => m[module.module.ngModule]),
                }

                feature.origin = module.remoteEntry

                this.link(route, feature)

                return route
            });

        // patch local routes

        let localModule = Object.values(modules).find(module => module.remoteEntry == undefined)
        let localFeatures = localModule!!.features

        this.linkRoutes(localRoutes, localFeatures)

        console.log([...localRoutes, ...lazyRoutes]) // TODO
        // done

        return [...localRoutes, ...lazyRoutes]
    }

    private fillFeatureRegistry(deployment : Deployment) {
        for (let module in deployment.modules) {
            let manifest = deployment.modules[module]

            if (manifest.type == "microfrontend")
                this.featureRegistry.registerRemote(manifest.name, ...manifest.features)
            else
                this.featureRegistry.register(...manifest.features)
        }

        this.featureRegistry.ready()
    }

    // public

    private setupDeployment(deployment : Deployment, reset: boolean) {
        ;(window as any)["deployment"] = () => {
            console.log(deployment)
        }

        // possibly reset feature registry

        if ( reset )
            this.featureRegistry.reset()

        // add local manifest

        let localManifest = this.portalConfig.localManifest

        ManifestDecorator.decorate(localManifest)

        localManifest.type = "shell"
        localManifest.isLoaded = true

        deployment.modules[localManifest.module.name] = localManifest

        // set remote definitions

        let remotes : any = {}

        for (let moduleName in deployment.modules) {
            let module = deployment.modules[moduleName]

            ManifestDecorator.decorate(module)

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
}
