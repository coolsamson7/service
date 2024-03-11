import {
    APP_INITIALIZER,
    InjectionToken, Injector,
    ModuleWithProviders,
    NgModule,
} from "@angular/core";
import { Route, RouteReuseStrategy, Routes } from "@angular/router";
import { PortalManager } from "./portal-manager";
import { DeploymentLoader, Manifest } from "./deployment";
import { ModulesModule } from "./modules";
import { HttpClientModule } from "@angular/common/http";
import { AboutModule } from "./about/about.module";
import { AbstractModule } from "./injection/abstract-module";
import { CommonModule } from "@angular/common";
import { FeatureReuseStrategy } from "./feature-reuse-strategy";

export type LocalConfig = {
  remotes : string[]
}

export type ServerConfig = any

export type LoaderConfig = {
    server? : ServerConfig,
    local?: LocalConfig
}
export type PortalModuleConfig = {
    loader : LoaderConfig,
    localRoutes : Routes,
    localManifest : Manifest,
    decorateRoutes? : RouteDecorator
}

export type RouteDecorator = (route : Route) => void

export const PortalModuleConfigToken = new InjectionToken<PortalModuleConfig>('PortalModuleConfig');


function loadDeployment(portalManager : PortalManager) : () => Promise<void> {
    return () => portalManager.loadDeployment();
}

@NgModule({
    imports: [CommonModule, ModulesModule, HttpClientModule, AboutModule],
    providers: [
        {
            provide: APP_INITIALIZER,
            useFactory: loadDeployment,
            multi: true,
            deps: [PortalManager]
        },
        {
            provide: RouteReuseStrategy,
            useClass: FeatureReuseStrategy
        },
    ],
    declarations: [],
    exports: []
})
export class PortalModule extends AbstractModule() {
    // constructor
    
    constructor(injector: Injector) {
        super(injector);
    }

    public static forRoot(config : PortalModuleConfig) : ModuleWithProviders<PortalModule> {
        return {
            ngModule: PortalModule,
            providers: [
                {
                    provide: PortalModuleConfigToken,
                    useValue: config
                },
                {
                    provide: DeploymentLoader,
                    useValue: config.loader
                },
            ]
        };
    }
}
