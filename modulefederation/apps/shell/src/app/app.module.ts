import {Injectable, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { NavbarModule } from './navbar/navbar.module';
import { MatSidenavModule } from '@angular/material/sidenav';

import { localRoutes } from "./local.routes";
import {LocalDeploymentLoader, PortalModule, Shell} from "@modulefederation/portal";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanDeactivate,
  Resolve,
  Route,
  Router,
  RouterModule,
  RouterStateSnapshot, UrlTree
} from "@angular/router";

import * as localManifest from "../assets/manifest.json"
import {Observable, of} from "rxjs";

@NgModule({
  imports: [RouterModule.forRoot(localRoutes)],
  exports: [RouterModule],
})
export class AppComponentRouterModule {}


// TEST

@Injectable({ providedIn: 'root' })
export class ActivateGuard implements CanActivate {
  // constructor

  constructor(private router : Router) {
  }

  // implement CanActivate

  /**
   * @inheritdoc
   */
  canActivate(route : ActivatedRouteSnapshot, state : RouterStateSnapshot) {
    let feature = route.data['feature']

    return true
  }
}

@Injectable({
  providedIn: 'root'
})
export class CanDeactivateGuard implements CanDeactivate<any> {
  // implement CanDeactivate

  /**
   * @inheritdoc
   */
  canDeactivate(
    component: any,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    let feature = currentRoute.data['feature']

    return of(true)
  }
}

@Injectable({
  providedIn: 'root'
})
export class I18nResolver implements Resolve<Observable<any>> {
  // constructor

  constructor(/*private translator: Translator*/) {}

  // implement Resolve

  /**
   * @inheritdoc
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    let feature = route.data['feature']

    //if (route.data.feature.i18n?.length) {
    //  return forkJoin(route.data.metadata.i18n.map((namespace) => this.translator.loadNamespace(namespace)));

    return of(true);
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
    BrowserAnimationsModule,
    NavbarModule,
    MatSidenavModule,
    AppComponentRouterModule,
    PortalModule.forRoot({
      loader: new LocalDeploymentLoader("http://localhost:4201", "http://localhost:4202"),
      localRoutes: localRoutes,
      localManifest: localManifest,
      decorateRoutes: (route: Route) => {
        route.resolve = {i18n: I18nResolver}
        route.canActivate = [ActivateGuard]
        route.canDeactivate = [ ]
      }
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
