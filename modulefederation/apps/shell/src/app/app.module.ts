import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { NavbarModule } from './navbar/navbar.module';
import { MatSidenavModule } from '@angular/material/sidenav';

import { localRoutes } from "./local.routes";
import {LocalDeploymentLoader, PortalModule, RegisterShell} from "@modulefederation/portal";
import {RouterModule} from "@angular/router";

import * as localManifest from "../assets/manifest.json"

@NgModule({
  imports: [RouterModule.forRoot(localRoutes)],
  exports: [RouterModule],
})
export class AppComponentRouterModule {}

@RegisterShell({
  name: 'app'
})
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NavbarModule,
    MatSidenavModule,
    AppComponentRouterModule,
    PortalModule.forRoot({
      loader: new LocalDeploymentLoader("http://localhost:4201", "http://localhost:4202"),
      localRoutes: localRoutes,
      localManifest: localManifest
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
