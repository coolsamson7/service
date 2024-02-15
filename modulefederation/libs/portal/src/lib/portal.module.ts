import {
    APP_INITIALIZER,
    InjectionToken, Injector,
    ModuleWithProviders,
    NgModule,
} from "@angular/core";
import { Route, Routes } from "@angular/router";
import { PortalManager } from "./portal-manager";
import { DeploymentLoader, Manifest } from "./deployment";
import { ModulesModule } from "./modules";
import { HttpClientModule } from "@angular/common/http";
import { AboutModule } from "./about/about.module";
import { AbstractModule } from "./injection/abstract-module";
import { CommonModule } from "@angular/common";

export type LoaderConfig = {
    remotes? : string[],
    server? : boolean
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
