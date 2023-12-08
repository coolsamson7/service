import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { NavbarModule } from './navbar/navbar.module';
import { MatSidenavModule } from '@angular/material/sidenav';

import { localRoutes } from "./local.routes";
import { RegisterModule } from "@modulefederation/portal";
import {Deployment} from "./deployment";

@RegisterModule({
  name: 'app'
})
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NavbarModule,
    MatSidenavModule, // <-- Add this line because of app.component.html
    RouterModule.forRoot(Deployment.instance.buildRoutes(localRoutes), { initialNavigation: 'enabledBlocking' }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
