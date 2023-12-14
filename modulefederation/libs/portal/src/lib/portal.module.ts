import {ReplaySubject} from "rxjs";
import {APP_INITIALIZER, InjectionToken, Injector, ModuleWithProviders, NgModule} from "@angular/core";
import {Route, Routes} from "@angular/router";
import {PortalManager} from "./portal-manager";
import {DeploymentLoader, Manifest} from "./deployment";
import {ModulesModule} from "./modules";
import {FeatureOutletDirective} from "./components";

export type PortalModuleConfig = {
    loader : DeploymentLoader,
    localRoutes : Routes,
    localManifest : Manifest,
    decorateRoutes? : RouteDecorator
}

export type RouteDecorator = (route : Route) => void

export const PortalModuleConfigToken = new InjectionToken<PortalModuleConfig>('PortalModuleConfig');


function loadPortalConfiguration(configurationService : PortalManager) : () => Promise<void> {
    return () => configurationService.load();
}

@NgModule({
    imports: [ModulesModule],
    providers: [
        {
            provide: APP_INITIALIZER,
            useFactory: loadPortalConfiguration,
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
