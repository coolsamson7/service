import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { appRoutes } from './app.routes';
import { NavbarModule } from './navbar/navbar.module';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RegisterModule } from "@modulefederation/portal";

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
    RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
