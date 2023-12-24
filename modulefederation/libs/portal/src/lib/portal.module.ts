import { ReplaySubject } from "rxjs";
import { APP_INITIALIZER, InjectionToken, Injector, ModuleWithProviders, NgModule } from "@angular/core";
import { Route, Routes } from "@angular/router";
import { PortalManager } from "./portal-manager";
import { DeploymentLoader, Manifest } from "./deployment";
import { ModulesModule } from "./modules";
import { FeatureOutletDirective } from "./components";
import { HttpClientModule } from "@angular/common/http";
import { AboutModule } from "./about/about.module";

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
    imports: [ModulesModule, HttpClientModule, AboutModule],
    providers: [
        {
            provide: APP_INITIALIZER,
            useFactory: loadDeployment,
            multi: true,
            deps: [PortalManager]
        },
    ],
    declarations: [FeatureOutletDirective],
    exports: [FeatureOutletDirective]
})
export class PortalModule {
    static injector = new ReplaySubject<Injector>(1);

    constructor(injector : Injector) {
        PortalModule.injector.next(injector);
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
