import { Injector, Injectable, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { ShellComponent } from './shell.component';
import { localRoutes } from './local.routes';

import {
  AbstractModule,
  CanActivateGuard,
  CanDeactivateGuard,
  EndpointLocator,
  I18nModule,
  I18nResolver,
  LocaleModule,
  PortalModule,
  PortalComponentsModule,
  SecurityModule,
  ServerTranslationLoader,
  Shell,
  Manifest,
  ConfigurationModule,
  ConfigurationManager,
  ValueConfigurationSource,
  ErrorModule,
  ErrorContext,
  ErrorHandler,
  ErrorManager,
  CommandModule,
  CommandErrorInterceptor,
} from '@modulefederation/portal';

import {
  ConsoleTrace,
  TraceLevel,
  TracerModule,
} from "@modulefederation/common";

import { Route } from '@angular/router';

import * as localManifest from '../assets/manifest.json';
import { environment } from '../environments/environment';
import { SampleAuthentication } from './security/sample-authentication';
import { SampleAuthorization } from './security/sample-authorization';
import { ShellRouterModule } from './shell-router.module';

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

class FooError extends Error {
   constructor(message: string) {
      super(message)
   }
}

@Injectable({ providedIn: 'root' })
export class ErrorHandlers {
  // handler

  @ErrorHandler()
  handleAny(error: any, context: ErrorContext) {
    console.log("ouch, any")

    ErrorManager.proceed()
  }

  @ErrorHandler()
  handleObject(error: Object, context: ErrorContext) {
    console.log("ouch, Object")

    ErrorManager.proceed()
  }

  @ErrorHandler()
  handleFooError(error: FooError, context: ErrorContext) {
    console.log("ouch, FooError")

    ErrorManager.proceed()
  }

  @ErrorHandler()
  handleString(error: string, context: ErrorContext) {
    console.log("ouch, string")

    ErrorManager.proceed()
  }

  @ErrorHandler()
  handleError(error: Error, context: ErrorContext) {
    console.log("ouch, Error")

    ErrorManager.proceed()
  }
}

@Shell({
  name: 'portal-shell',
})
@NgModule({
  declarations: [ShellComponent],
  imports: [
    BrowserModule,
    ShellRouterModule,

    // error

    ErrorModule.forRoot({
      handler: [ErrorHandlers]
    }),

    // commands

    CommandModule.forRoot({
      interceptors: [CommandErrorInterceptor]
    }),

    // configuration

    ConfigurationModule.forRoot(new ValueConfigurationSource(environment)),

    // authentication & authorization

    SecurityModule.forRoot({
      authentication: SampleAuthentication,
      authorization: SampleAuthorization,
    }),

    // tracing

    TracerModule.forRoot({
      enabled: !environment.production,
      trace: new ConsoleTrace('%d [%p]: %m\n'), // d(ate), l(evel), p(ath), m(message)
      paths: {
        portal: TraceLevel.FULL,
        error: TraceLevel.FULL
      },
    }),

    // manages the current locale

    LocaleModule.forRoot({
      locale: 'en-US',
      supportedLocales: ['en-US', 'de-DE'],
    }),

    // localization

    I18nModule.forRoot({
      loader: { type: ServerTranslationLoader },
    }),

    // portal components

    PortalComponentsModule,

    // the main microfrontend logic

    PortalModule.forRoot({
      loader: {
        server: {},
        //local: { remotes: ["http://localhost:4201", "http://localhost:4202"]}
      },
      localRoutes: localRoutes,
      localManifest: localManifest as Manifest,
      decorateRoutes: (route: Route) => {
        route.resolve = { i18n: I18nResolver };
        route.canActivate = [CanActivateGuard];
        route.canDeactivate = [CanDeactivateGuard];
      },
    }),
  ],
  providers: [
    {
      provide: EndpointLocator,
      useClass: ApplicationEndpointLocator,
    },
  ],
  bootstrap: [ShellComponent],
})
export class ShellModule extends AbstractModule() {
  constructor(injector: Injector) {
    super(injector);
  }
}
