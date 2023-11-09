import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { OAuthModule } from 'angular-oauth2-oidc';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
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
import { SharedModule } from './auth/auth.guard';
import { environment } from "../environments/environment"
import { Environment, EnvironmentModule } from './common/util/environment.service';
import { EndpointLocator } from './common/communication/endpoint-locator';

export class ApplicationEndpointLocator extends EndpointLocator {
  // instance data

  private environment: Environment

  // constructor

  constructor(environment: any) {
    super()

    this.environment = new Environment(environment)
  }

  // implement 

  getEndpoint(domain: string): string {
    if ( domain == "admin")
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
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    TranslocoRootModule,
    AppRoutingModule, 
    ComponentsModule,
    NodesModule,
    MaterialModule,
    EnvironmentModule.forRoot(environment),
    SharedModule.forRoot(),
    OAuthModule.forRoot({
      resourceServer: {
          allowedUrls: [environment.administration.server + '/administration'], // no service available yet...
          sendAccessToken: true
      }
    })
  ],
  providers: [{provide: EndpointLocator, useValue: new ApplicationEndpointLocator(environment)}],
  bootstrap: [AppComponent]
})
export class AppModule { }
