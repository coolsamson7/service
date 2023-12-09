import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { NavbarModule } from './navbar/navbar.module';
import { MatSidenavModule } from '@angular/material/sidenav';

import { localRoutes } from "./local.routes";
import { LocalDeploymentLoader, PortalModule, RegisterModule} from "@modulefederation/portal";
import {RouterModule} from "@angular/router";

@NgModule({
  imports: [RouterModule.forRoot(localRoutes)],
  exports: [RouterModule],
})
export class AppComponentRouterModule {}

@RegisterModule({
  name: 'app'
})
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NavbarModule,
    MatSidenavModule,
    //RouterModule,
    AppComponentRouterModule,
    PortalModule.forRoot({
      loader: new LocalDeploymentLoader("http://localhost:4201", "http://localhost:4202"),
      localRoutes: localRoutes
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
