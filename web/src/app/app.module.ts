import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { OAuthModule } from 'angular-oauth2-oidc';
import { AppComponent, ApplicationEndpointLocator } from './app.component';
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
import { EndpointLocatorInjectionToken } from './common/communication/endpoint-locator';
import { SharedModule } from './auth/auth.guard';


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
    SharedModule.forRoot(),
    OAuthModule.forRoot({
      resourceServer: {
          allowedUrls: ['http://localhost:8083/administration'],
          sendAccessToken: true
      }
    })
  ],
  providers: [
    {
      provide: EndpointLocatorInjectionToken,
      useValue: new ApplicationEndpointLocator()
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
