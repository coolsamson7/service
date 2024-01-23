import "reflect-metadata";

import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, Injectable, Injector, NgModule } from '@angular/core';

import { OAuthModule, OAuthStorage } from 'angular-oauth2-oidc';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { MaterialModule } from './material/material.module';
import { NodesModule } from './nodes/nodes.module';
import { PortalComponentModule } from './portal/portal.module';
import { SharedModule } from './auth/auth.guard';
import { environment } from "../environments/environment"
import {
  AbstractModule,
  CanDeactivateGuard,
  CommandModule,
  ConsoleTrace,
  EndpointLocator,
  Environment,
  EnvironmentModule, ErrorModule,
  FeatureReuseStrategy,
  HTTPErrorInterceptor, I18nModule, I18nResolver, Injected, LocaleModule,
  Manifest,
  OIDCAuthentication, OIDCModule,
  OIDCSessionManager,
  PortalComponentsModule,
  PortalModule,
  SecurityModule, ServerTranslationLoader,
  SessionManager,
  Shell,
  StateModule,
  TraceLevel,
  TracerModule
} from "@modulefederation/portal";
import { MonacoEditorModule } from "./widgets/monaco-editor/monaco-editor.module";
import { MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarModule } from "@angular/material/snack-bar";
import { MatIconModule } from "@angular/material/icon";

import { localRoutes } from "./local.routes";
import { Route, RouteReuseStrategy } from "@angular/router";

import * as localManifest from "../assets/manifest.json"
import { ComponentsModule } from "./components/components.module";
import { authConfig } from './auth.config';
import { TranslationModule } from "./translation/translation.module";
import { GlobalErrorHandler } from './error/global-error-handler';
import { UserComponent } from "./header/user/user.component";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatProgressBarModule } from '@angular/material/progress-bar';

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
        if (domain.startsWith("admin"))
            return this.environment.get<string>("administration.server")!!
        else
            throw new Error("unknown domain " + domain)
    }
}

export function storageFactory() : OAuthStorage {
    return localStorage
  }


@Shell({
    name: "shell"
})
@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        MatSnackBarModule,
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        MatIconModule,
        AppRoutingModule,
        ComponentsModule,
        TranslationModule,
        NodesModule,
        PortalComponentsModule,
        PortalComponentModule,
        MaterialModule,
        ErrorModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,

        TracerModule.forRoot({
            enabled: environment.production !== false,
            trace: new ConsoleTrace('%d [%p]: %m\n'), // d(ate), l(evel), p(ath), m(message)
            paths: {
              "portal": TraceLevel.FULL,
              "controller": TraceLevel.FULL,
            }
          }),

        LocaleModule.forRoot({
            locale: 'en-US',
            supportedLocales: ['en-US', 'de-DE']
        }),

        I18nModule.forRoot({
            loader: {type: ServerTranslationLoader}
        }),

        PortalModule.forRoot({
            loader: {
                //server: true,
                remotes: []
            },
            localRoutes: localRoutes,
            localManifest: localManifest as Manifest,
            decorateRoutes: (route : Route) => {
                route.resolve = {i18n: I18nResolver}
                //route.canActivate = [CanActivateGuard, AuthGuard] // TODO??
                route.canDeactivate = [CanDeactivateGuard]
            }
        }),
        
        CommandModule.forRoot(),

        OIDCModule.forRoot({
            authConfig: authConfig
        }),

        StateModule.forRoot({
        }),

        SecurityModule.forRoot({
            sessionManager: OIDCSessionManager,
            authentication: OIDCAuthentication,
            //authorization: SampleAuthorization
        }),

        MonacoEditorModule.forRoot({
            defaultOptions: {theme: 'vs-dark', language: 'json'}
        }),

        EnvironmentModule.forRoot(environment),
        SharedModule.forRoot(),
        OAuthModule.forRoot({
            resourceServer: {
                allowedUrls: [environment.administration.server + '/administration'], // no service available yet...
                sendAccessToken: true
            }
        }),
        UserComponent
    ],
    providers: [
        //{ provide: OAuthStorage, useFactory: storageFactory },
        /*{
          provide: ErrorHandler,
          useClass: GlobalErrorHandler
        },*/
        {
           provide: RouteReuseStrategy,
           useClass: FeatureReuseStrategy
        },
        {
            provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
            useValue: {duration: 2500}
        },
        {
            provide: EndpointLocator,
            useValue: new ApplicationEndpointLocator(environment)
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: HTTPErrorInterceptor,
            multi: true
        }],
    bootstrap: [AppComponent]
})
export class AppModule extends AbstractModule() {
    constructor(injector: Injector) {
        super(injector)
    }
}

// TEST

class Foo {
    // variables

    @Injected()
    locator!: EndpointLocator

    bar!: SessionManager

    // constructor

    constructor(private id: string) {
        console.log("created " + id)
    }
}

let d = PortalModule.New(Foo, {bar: SessionManager})("foo")

console.log(d)
