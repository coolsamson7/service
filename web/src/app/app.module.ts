import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { OAuthModule } from 'angular-oauth2-oidc';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { TranslocoRootModule } from './transloco-root.module';
import { ComponentsModule } from './components/components.module';
import { AppRoutingModule } from './app-routing.module';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { HomeComponent } from './home/home-component';
import { MaterialModule } from './material/material.module';
import { LayoutComponent } from './layout/layout.component';
import { HeaderComponent } from './navigation/header/header.component';
import { SidenavListComponent } from './navigation/sidenav-list/sidenav-list.component';
import { NodesModule } from './nodes/nodes.module';
import { PortalModule } from './portal/portal.module';
import { SharedModule } from './auth/auth.guard';
import { environment } from "../environments/environment"
import { Environment, EnvironmentModule } from './common/util/environment.service';
import { EndpointLocator } from './common/communication/endpoint-locator';
import { HTTPErrorInterceptor } from './common/communication/http-error-interceptor';
import { MonacoEditorModule } from "./widgets/monaco-editor/monaco-editor.module";
import { MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarModule } from "@angular/material/snack-bar";

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
      return this.environment.get<string>("administration.server");
    else
      throw new Error("unknown domain " + domain)
  }
}

@NgModule({
    declarations: [
        AppComponent,
        PageNotFoundComponent,
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
        TranslocoRootModule,
        AppRoutingModule,
        ComponentsModule,
        NodesModule,
        PortalModule,
        MaterialModule,
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
    exports: [
        HeaderComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
