import { Inject, Injectable, Injector } from "@angular/core";

import { LoadChildrenCallback, Route, Router, Routes } from "@angular/router";
import { loadRemoteModule, setRemoteDefinitions } from "@nrwl/angular/mf";
import { PortalModuleConfig, PortalModuleConfigToken } from "./portal.module";
import { FeatureRegistry } from "./feature-registry";
import { Deployment } from "./deployment/deployment-model";
import { ModuleRegistry } from "./modules";
import { FeatureConfig } from "./feature-config";
import { DeploymentLoader, HTTPDeploymentLoader, LocalDeploymentLoader, ManifestDecorator } from "./deployment";
import { TraceLevel, Tracer } from "./tracer";
import { PathResolveService } from "./page-not-found/page-not-found-resolver";
import { PageNotFoundComponent } from "./page-not-found/page-not-found-components";
import { ReplaySubject } from "rxjs";

/**
 * the runtime data of feature
 */
export interface FeatureData extends FeatureConfig {
    // computed after resolving parent links

    //children? : FeatureConfig[]
    $parent? : FeatureConfig

    // computed

    enabled? : boolean
    module? : any
    origin? : string
    routerPath? : string
    path? : string

    ngComponent? : any
    load? : LoadChildrenCallback
}

@Injectable({providedIn: 'root'})
export class PortalManager {
  // static data

  static instance= new ReplaySubject<PortalManager>(1)

  // instance data

    deployment : Deployment = {
        modules: {}
    }

    routes : { [path : string] : Route } = {}

    // constructor

  constructor(
        @Inject(PortalModuleConfigToken) private portalConfig : PortalModuleConfig,
        private featureRegistry : FeatureRegistry,
        private moduleRegistry : ModuleRegistry,
        private router : Router,
        private injector : Injector
    ) {
    }

    static registerLazyRoutes(feature : string, routes : Routes) : Routes {
      PortalManager.instance.subscribe(injector =>
        injector.registerLazyRoutes(feature, routes))

        return routes
    }

    loadDeployment(merge = false) : Promise<void> {
        let loader : DeploymentLoader

        if (this.portalConfig.loader.server)
            loader = this.injector.get(HTTPDeploymentLoader)
        else
            loader = new LocalDeploymentLoader(...this.portalConfig.loader.remotes!!)

        return loader
            .load()
            .then((deployment) => this.setupDeployment(deployment, merge))
    }

    // private

    private registerLazyRoutes(feature : string, routes : Routes) {
        if (Tracer.ENABLED)
            Tracer.Trace("portal", TraceLevel.FULL, "register lazy routes for {0}", feature)

        // local functions

        const rootFeature = this.featureRegistry.getFeature(feature)
        const rootRoute = routes.find(route => route.redirectTo == undefined)

        // we just loaded it, so set it to undefined

        rootFeature.load = undefined

        this.link(rootRoute!!, rootFeature) // TODO FALSCH: children werden nicht berücksichtigt?

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

            const componentType : any = route.component

            componentType['$$feature'] = feature
        }

        // remember load function

        if (route.loadChildren) {
            feature.load = route.loadChildren
            if (!feature.origin)
                feature.origin = feature.module
        }
    }

    private linkRoutes(routes : Routes, features : FeatureData[]) {
        // local functions

        const featureRoute = (feature : FeatureConfig) => {
            return feature.router?.path ? feature.router.path : feature.id
        }

        const findFeature4 = (route : string) => {
            return features.find(feature => {
              return featureRoute(feature) == route
            })
        }

        // go

        let index = 0
        while (index < routes.length) {
            const route = routes[index++]

            if (!route.redirectTo) { // leave redirects
                const feature = findFeature4(route.path!!)

                if (feature) {
                    this.link(route, feature)

                    // recursion

                    if (route.children && route.children.length > 0)
                        this.linkRoutes(route.children, feature.children!!)
                }
                else {
                    console.log("did not find feature for path " + route.path!!)
                    //throw new Error("did not find feature for path " + route.path!!)
                }
            } // if
        } // while
    }

    private buildRoutes(deployment : Deployment, localRoutes : Routes, merge : boolean) : Routes {
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
                    route = {
                        path: key,
                        loadChildren: () => loadRemoteModule(key, './Module')
                            .then((m) => m[module.module])
                    }

                    feature.origin = module.remoteEntry

                    this.link(route, feature)

                    // remember

                    this.routes[key] = route
                } // if

                return route
            });

        if (!merge) {
            // patch local routes

            const localModule = Object.values(modules).find(module => module.remoteEntry == undefined)
            const localFeatures = localModule!!.features

            this.linkRoutes(localRoutes, localFeatures)
        }

        const pageNotFoundRoute : Route = {
            path: '**',
            pathMatch: 'full',
            resolve: {
                path: PathResolveService
            },
            component: PageNotFoundComponent
        }

        const routes = [...localRoutes, ...lazyRoutes/*,  pageNotFoundRoute*/]

        // done

        return routes
    }

    private fillFeatureRegistry(deployment : Deployment, previousDeployment : Deployment) {
        const disabledModules = {...previousDeployment.modules}

        for (const module in deployment.modules) {
            delete disabledModules[module]

            const manifest = deployment.modules[module]

            const prevManifest = this.deployment.modules[module]
            if (prevManifest) {
                // forget about local features, since they never change

                if (manifest.type == "microfrontend") {
                    // copy manifest

                    prevManifest.enabled = manifest.enabled

                    // we need to merge ( e.g. the enabled status )

                    const rootFeature : FeatureData = manifest.features.find(feature => feature.id == "")!!
                    // append the rest as children
                    rootFeature.children = manifest.features.filter(feature => feature.id != "")!!

                    this.featureRegistry.mergeFeature(this.featureRegistry.getFeature(manifest.name), rootFeature)
                }
            }
            else {
                // register folders first

                this.featureRegistry.registerFolders(...manifest.folders)

                // register features

                if (manifest.type == "microfrontend")
                    this.featureRegistry.registerRemote(manifest.name, ...manifest.features)
                else
                    this.featureRegistry.register(...manifest.features)

                // remember

                this.deployment.modules[module] = manifest
            }
        }

        // all modules that are not part of the deployment anymore are disabled!

        for (const disabled in disabledModules) {
            const manifest = this.deployment.modules[disabled]

            if (manifest.type == "microfrontend")
                this.featureRegistry.disable(manifest.name)
        }

        // done

        this.featureRegistry.ready()
    }

    // public

    private setupDeployment(deployment : Deployment, merge : boolean) {
        ;(window as any)["deployment"] = () => {
            console.log(deployment)
        }

        if (!merge) {
            // add local manifest

            const localManifest = ManifestDecorator.decorate(this.portalConfig.localManifest)

            localManifest.type = "shell"
            localManifest.isLoaded = true

            deployment.modules[localManifest.name] = localManifest
        }

        // set remote definitions

        const remotes : any = {}

        for (const moduleName in deployment.modules) {
            const module = ManifestDecorator.decorate(deployment.modules[moduleName])

            module.isLoaded = false

            this.moduleRegistry.register(module) // will keep original

            if (module.remoteEntry) {
                module.type = "microfrontend"

                remotes[moduleName] = module.remoteEntry
            }
        }

        setRemoteDefinitions(remotes)

        // fill feature registry

        this.fillFeatureRegistry(deployment, this.deployment)

        // inform guys interested in me ( like registerLazyRoutes )

        PortalManager.instance.next(this)

        // setup routes

        this.router.resetConfig(this.buildRoutes(deployment, this.portalConfig.localRoutes, merge))
    }
}
