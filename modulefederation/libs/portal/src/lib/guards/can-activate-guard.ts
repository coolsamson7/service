import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";

import { Observable } from "rxjs";
import { FeatureData } from "../portal-manager";

@Injectable({providedIn: 'root'})
export class CanActivateGuard implements CanActivate {
    // constructor

    constructor(private router : Router) {
    }

    // implement CanActivate

    /**
     * @inheritdoc
     */
    canActivate(route : ActivatedRouteSnapshot, state : RouterStateSnapshot) : Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        let feature : FeatureData = route.data['feature']

        return feature.enabled == true
    }
}
