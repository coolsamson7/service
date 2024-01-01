import { Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { ShellComponent } from './shell.component';

import { localRoutes } from "./local.routes";

import {
    AbstractModule,
    CanActivateGuard,
    CanDeactivateGuard,
    ConsoleTrace,
    EndpointLocator,
    Environment,
    EnvironmentModule, I18nModule, I18nResolver, LocaleModule, PortalComponentsModule,
    PortalModule,
    SecurityModule, ServerTranslationLoader,
    Shell,
    TraceLevel,
    TracerModule
} from "@modulefederation/portal";
import {  Route, RouterModule } from "@angular/router";

import * as localManifest from "../assets/manifest.json"
import { environment } from "../environments/environment";
import { SampleAuthentication } from "./security/sample-authentication";
import { SampleAuthorization } from "./security/sample-authorization";
import { MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarModule } from "@angular/material/snack-bar";

@NgModule({
    imports: [RouterModule.forRoot(localRoutes)],
    exports: [RouterModule],
})
export class AppComponentRouterModule {
}


export class ApplicationEndpointLocator extends EndpointLocator {
    // instance data

    private environment : Environment

    // constructor

    constructor(environment : any) {
        super()

        this.environment = new Environment(environment)
    }

    // implement

    getEndpoint(domain : string) : string {
        if (domain == "admin")
            return this.environment.get<string>("administration.server")!!
        else
            throw new Error("unknown domain " + domain)
    }
}


@Shell({
    name: 'shell'
})
@NgModule({
    declarations: [ShellComponent],
    imports: [
        BrowserModule,
        AppComponentRouterModule,
        MatSnackBarModule,

        EnvironmentModule.forRoot(environment),

        SecurityModule.forRoot({
            authentication: SampleAuthentication,
            authorization: SampleAuthorization
        }),

        TracerModule.forRoot({
            enabled: !environment.production,
            trace: new ConsoleTrace('%d [%p]: %m\n'), // d(ate), l(evel), p(ath), m(message)
            paths: {
                "portal": TraceLevel.FULL,
            }
        }),

        PortalComponentsModule,

        LocaleModule.forRoot({
            locale: 'en-US',
            supportedLocales: ['en-US', 'de-DE']
        }),

        I18nModule.forRoot({
            loader: { type: ServerTranslationLoader }
        }),

        PortalModule.forRoot({
            loader: {
                //server: true,
                remotes: ["http://localhost:4201", "http://localhost:4202"]
            },
            localRoutes: localRoutes,
            localManifest: localManifest,
            decorateRoutes: (route : Route) => {
                route.resolve = {i18n: I18nResolver}
                route.canActivate = [CanActivateGuard]
                route.canDeactivate = [CanDeactivateGuard]
            }
        }),
    ],
    providers: [
        {
            provide: EndpointLocator,
            useValue: new ApplicationEndpointLocator(environment)
        },
        {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 2500}}
    ],
    bootstrap: [ShellComponent],
})
export class ShellModule extends AbstractModule() {
    constructor(injector: Injector) {
        super(injector);
    }
}
