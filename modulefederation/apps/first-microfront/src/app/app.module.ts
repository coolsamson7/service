import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import {
  ConsoleTrace,
  EndpointLocator, Environment,
  I18nModule,
  LocaleModule,
  Manifest,
  PortalComponentsModule,
  PortalModule,
  SecurityModule,
  ServerTranslationLoader,
  TraceLevel,
  TracerModule
} from "@modulefederation/portal";
import { environment } from "../environments/environment";
import { appRoutes } from "./app.routes";
import * as localManifest from "../assets/manifest.json"
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from "@angular/material/snack-bar";

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

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,

    SecurityModule.forRoot({}),

    PortalModule.forRoot({
      loader: {
        //server: true,
        remotes: []
      },
      localRoutes: appRoutes,
      localManifest: localManifest as Manifest,
    }),

    TracerModule.forRoot({
      enabled: true,
      trace: new ConsoleTrace('%d [%p]: %m\n'), // d(ate), l(evel), p(ath), m(message)
      paths: {
        "portal": TraceLevel.FULL,
      }
    }),

    PortalComponentsModule,

    LocaleModule.forRoot({
      locale: 'en-US',
      supportedLocales: ['en-US', 'de-DE']
    }),

    I18nModule.forRoot({
      loader: {type: ServerTranslationLoader}
    }),

    RouterModule.forRoot(
      [
        {
          path: '',
          loadChildren: () =>
            import('./remote-entry/remote-entry.module').then(
              (m) => m.RemoteEntryModule
            ),
        },
      ],
    ),
  ],
  providers: [
    {
      provide: EndpointLocator,
      useValue: new ApplicationEndpointLocator(environment)
    },
    {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 2500}}
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
