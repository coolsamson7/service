import { NgModule, Injectable } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import {
  EndpointLocator,
  I18nModule,
  LocaleModule,
  Manifest,
  PortalModule,
  SecurityModule,
  ServerTranslationLoader,
  ConfigurationModule,
  ConfigurationManager,
  ValueConfigurationSource,
} from '@modulefederation/portal';

import {
  ConsoleTrace,
  TraceLevel,
  TracerModule,
} from "@modulefederation/common";

import { environment } from '../environments/environment';
import { appRoutes } from './app.routes';
import * as localManifest from '../assets/manifest.json';
import { AppRouterModule } from './app-router.module';

@Injectable({ providedIn: 'root' })
export class ApplicationEndpointLocator extends EndpointLocator {
  // constructor

  constructor(private configuration: ConfigurationManager) {
    super();
  }

  // implement

  getEndpoint(domain: string): string {
    return this.configuration.get<string>('backend.' + domain)!;
  }
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,

    // configuration values

    ConfigurationModule.forRoot(new ValueConfigurationSource(environment)),

    // authentication & authorization

    SecurityModule.forRoot({}),

    // the portal logic

    PortalModule.forRoot({
      loader: {
        local: {
          remotes: [],
        },
      },
      localRoutes: appRoutes,
      localManifest: localManifest as Manifest,
    }),

    // tracing configuration

    TracerModule.forRoot({
      enabled: true,
      trace: new ConsoleTrace('%d [%p]: %m\n'), // d(ate), l(evel), p(ath), m(message)
      paths: {
        portal: TraceLevel.FULL,
      },
    }),

    // manages the current locale

    LocaleModule.forRoot({
      locale: 'en-US',
      supportedLocales: ['en-US', 'de-DE'],
    }),

    // i18n

    I18nModule.forRoot({
      loader: { type: ServerTranslationLoader },
    }),

    // the application routes

    AppRouterModule,
  ],
  providers: [
    {
      provide: EndpointLocator,
      useClass: ApplicationEndpointLocator,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
