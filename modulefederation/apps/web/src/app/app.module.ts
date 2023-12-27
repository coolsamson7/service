import { BrowserModule } from '@angular/platform-browser';
import { Injector, NgModule } from '@angular/core';

import { OAuthModule } from 'angular-oauth2-oidc';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './home/home-component';
import { MaterialModule } from './material/material.module';
import { NodesModule } from './nodes/nodes.module';
import { PortalComponentModule } from './portal/portal.module';
import { SharedModule } from './auth/auth.guard';
import { environment } from "../environments/environment"
import {
    AbstractModule,
    CanDeactivateGuard,
    EndpointLocator,
    Environment,
    EnvironmentModule,
    HTTPErrorInterceptor,
    Manifest,
    OIDCAuthentication, OIDCModule,
    OIDCSessionManager,
    PortalComponentsModule,
    PortalModule,
    SecurityModule,
    SessionManager,
    Shell
} from "@modulefederation/portal";
import { MonacoEditorModule } from "./widgets/monaco-editor/monaco-editor.module";
import { MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarModule } from "@angular/material/snack-bar";
import { MatIconModule } from "@angular/material/icon";

import { localRoutes } from "./local.routes";
import { Route } from "@angular/router";

import * as localManifest from "../assets/manifest.json"
import { ComponentsModule } from "./components/components.module";
import { authConfig } from './auth.config';
import { Injected } from "../../../../libs/portal/src/lib/injection/injected.decorator";
import { TranslationModule } from "./translation/translation.module";


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
    name: "shell"
})
@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
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

        PortalModule.forRoot({
            loader: {
                //server: true,
                remotes: []
            },
            localRoutes: localRoutes,
            localManifest: localManifest as Manifest,
            decorateRoutes: (route : Route) => {
                //route.resolve = {i18n: I18nResolver}
                //route.canActivate = [CanActivateGuard, AuthGuard] // TODO??
                route.canDeactivate = [CanDeactivateGuard]
            }
        }),

        OIDCModule.forRoot({
            authConfig: authConfig
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
        })
    ],
    providers: [
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
