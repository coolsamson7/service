import {Injectable, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';

import {localRoutes} from "./local.routes";

import {
    CanActivateGuard,
    CanDeactivateGuard,
    ConsoleTrace,
    EndpointLocator,
    Environment,
    EnvironmentModule,
    PortalModule,
    Shell,
    TraceLevel,
    TracerModule
} from "@modulefederation/portal";
import {
    ActivatedRouteSnapshot,
    Resolve,
    Route,
    RouterModule
} from "@angular/router";

import * as localManifest from "../assets/manifest.json"
import {Observable, of} from "rxjs";
import { environment } from "../environments/environment";

@NgModule({
    imports: [RouterModule.forRoot(localRoutes)],
    exports: [RouterModule],
})
export class AppComponentRouterModule {
}


@Injectable({
    providedIn: 'root'
})
export class I18nResolver implements Resolve<Observable<any>> {
    // constructor

    constructor(/*private translator: Translator*/) {
    }

    // implement Resolve

    /**
     * @inheritdoc
     */
    resolve(route : ActivatedRouteSnapshot) : Observable<any> {
        let feature = route.data['feature']

        //if (route.data.feature.i18n?.length) {
        //  return forkJoin(route.data.metadata.i18n.map((namespace) => this.translator.loadNamespace(namespace)));

        return of(true);
    }
}

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
      return this.environment.get<string>("administration.server")!!
    else
      throw new Error("unknown domain " + domain)
  }
}


// TEST
@Shell({
    name: 'app'
})
@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        AppComponentRouterModule,

        EnvironmentModule.forRoot(environment),

        TracerModule.forRoot({
            enabled: !environment.production,
            trace: new ConsoleTrace('%d [%p]: %m\n'), // d(ate), l(evel), p(ath), m(message)
            paths: {
                "portal": TraceLevel.FULL,
            }
        }),

        PortalModule.forRoot({
            loader: {
              server: true,
              //remotes: ["http://localhost:4201", "http://localhost:4202"]
            },
            localRoutes: localRoutes,
            localManifest: localManifest,
            decorateRoutes: (route : Route) => {
                route.resolve = {i18n: I18nResolver}
                route.canActivate = [CanActivateGuard]
                route.canDeactivate = [CanDeactivateGuard]
            }
        }),
    ],
    providers: [
      {
        provide: EndpointLocator,
        useValue: new ApplicationEndpointLocator(environment)
      },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {
}
