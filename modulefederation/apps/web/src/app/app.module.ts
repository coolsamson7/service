import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { OAuthModule } from 'angular-oauth2-oidc';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ComponentsModule } from './components/components.module';
import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './home/home-component';
import { MaterialModule } from './material/material.module';
import { LayoutComponent } from './layout/layout.component';
import { HeaderComponent } from './navigation/header/header.component';
import { SidenavListComponent } from './navigation/sidenav-list/sidenav-list.component';
import { NodesModule } from './nodes/nodes.module';
import { PortalComponentsModule } from './portal/portal.module';
import { SharedModule } from './auth/auth.guard';
import { environment } from "../environments/environment"
import {
  CanDeactivateGuard,
  EndpointLocator,
  Environment,
  EnvironmentModule,
  HTTPErrorInterceptor,
  Manifest, OIDCAuthentication,
  PortalModule, SecurityModule, SessionManager,
  Shell
} from "@modulefederation/portal";
import { MonacoEditorModule } from "./widgets/monaco-editor/monaco-editor.module";
import { MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarModule } from "@angular/material/snack-bar";
import { MatIconModule } from "@angular/material/icon";

import { localRoutes } from "./local.routes";
import { Route } from "@angular/router";

import * as localManifest from "../assets/manifest.json"
import { SampleAuthentication } from "../../../shell/src/app/security/sample-authentication";
import { SampleAuthorization } from "../../../shell/src/app/security/sample-authorization";
import { OIDCSessionManager } from "../../../../libs/portal/src/lib/security/oidc/oidc-session-manager";

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
    LayoutComponent,
    HeaderComponent,
    SidenavListComponent
  ],
  imports: [
    MatSnackBarModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatIconModule,
    AppRoutingModule,
    ComponentsModule,
    NodesModule,
    PortalComponentsModule,
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
    {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 2500}},
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
export class AppModule {
  constructor(sessionManager: SessionManager<any, any>) {
    console.log(sessionManager)
  }
}
