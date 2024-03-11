import { Injectable, Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { ShellComponent } from './shell.component';

import { localRoutes } from "./local.routes";

import {
    AbstractModule,
    CanActivateGuard,
    CanDeactivateGuard,
    ConfigurationManager,
    ConfigurationModule,
    ConsoleTrace,
    EndpointLocator,
    I18nModule, I18nResolver, LocaleModule, Manifest, PortalComponentsModule,
    PortalModule,
    SecurityModule, ServerTranslationLoader,
    Shell,
    TraceLevel,
    TracerModule,
    ValueConfigurationSource
} from "@modulefederation/portal";
import {  Route } from "@angular/router";

import * as localManifest from "../assets/manifest.json"
import { environment } from "../environments/environment";
import { SampleAuthentication } from "./security/sample-authentication";
import { SampleAuthorization } from "./security/sample-authorization";
import { MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarModule } from "@angular/material/snack-bar";
import { ShellRouterModule } from './shell-router.module';


@Injectable({providedIn: 'root'})
export class ApplicationEndpointLocator extends EndpointLocator {
  // constructor

  constructor(private configuration : ConfigurationManager) {
    super()
  }

  // implement

  getEndpoint(domain : string) : string {
    return this.configuration.get<string>("backend." + domain)!
  }
}


@Shell({
    name: 'shell'
})
@NgModule({
    declarations: [ShellComponent],
    imports: [
        BrowserModule,
        ShellRouterModule,
        MatSnackBarModule,

        ConfigurationModule.forRoot(new ValueConfigurationSource(environment)),

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
                server: true,
                //remotes: []//"http://localhost:4201", "http://localhost:4202"]
            },
            localRoutes: localRoutes,
            localManifest: localManifest as Manifest,
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
            useClass: ApplicationEndpointLocator
        },
        {
            provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, 
            useValue: {
                duration: 2500
            }
        }
    ],
    bootstrap: [ShellComponent],
})
export class ShellModule extends AbstractModule() {
    constructor(injector: Injector) {
        super(injector);
    }
}
