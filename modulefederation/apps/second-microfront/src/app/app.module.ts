import { Injectable, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import {
  ConfigurationManager,
  ConfigurationModule,
  EndpointLocator,
  I18nModule,
  LocaleModule,
  Manifest,
  PortalComponentsModule,
  PortalModule,
  SecurityModule,
  ServerTranslationLoader,
  ValueConfigurationSource
} from "@modulefederation/portal";

import {
  ConsoleTrace,
  TraceLevel,
  TracerModule,
} from "@modulefederation/common";

import { environment } from "../environments/environment";
import { appRoutes } from "./app.routes";
import * as localManifest from "../assets/manifest.json"
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from "@angular/material/snack-bar";
import { AppRouterModule } from "./app-router.module";

@Injectable({providedIn: 'root'})
export class ApplicationEndpointLocator extends EndpointLocator {
  // constructor

  constructor(private configuration : ConfigurationManager) {
    super()
  }

  // implement

  getEndpoint(domain : string) : string {
    return this.configuration.get<string>("backend." + domain)!
  }
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,

    ConfigurationModule.forRoot(new ValueConfigurationSource(environment)),

    SecurityModule.forRoot({}),

    PortalModule.forRoot({
      loader: {
        //server: {},
        local: {
          remotes: []
        }
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

    PortalModule,
    PortalComponentsModule,

    LocaleModule.forRoot({
      locale: 'en-US',
      supportedLocales: ['en-US', 'de-DE']
    }),

    I18nModule.forRoot({
      loader: {type: ServerTranslationLoader}
    }),

    AppRouterModule,
  ],
  providers: [
    {
      provide: EndpointLocator,
      useClass: ApplicationEndpointLocator
    },
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, 
      useValue: {
        duration: 2500
      }
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
