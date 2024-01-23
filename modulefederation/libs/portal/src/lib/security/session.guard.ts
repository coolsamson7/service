import { Injectable } from "@angular/core";
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from "@angular/router";
import { FeatureData } from "../portal-manager";
import { Observable, filter, map, tap } from "rxjs";
import { SessionManager } from "./session-manager";

@Injectable()
export class SessionGuard implements CanActivate {
  // constructor

  constructor(private router : Router, private sessionManager : SessionManager) {
  }

  // private

  private needsSession(feature : FeatureData ) : boolean {
    return feature.visibility !== undefined && feature.visibility?.includes("private") && !feature.visibility?.includes("public")
  }

  // implement CanActivate

  canActivate(route : ActivatedRouteSnapshot, state : RouterStateSnapshot) : Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const feature : FeatureData = route.data['feature']

    if ( feature )
        return this.sessionManager.ready$
            .pipe(filter(ready => ready))
            .pipe(tap(_ => {
                if (this.needsSession(feature) && !this.sessionManager.hasSession()) {
                    this.sessionManager.login()

                    return false
                }
                else return true
            }))

    else return true    
  }
}