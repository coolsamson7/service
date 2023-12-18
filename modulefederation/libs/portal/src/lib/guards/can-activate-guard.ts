import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { FeatureData } from "@modulefederation/portal";
import { Observable } from "rxjs";

@Injectable({providedIn: 'root'})
export class CanActivateGuard implements CanActivate {
    // constructor

    constructor(private router : Router) {
    }

    // implement CanActivate

    /**
     * @inheritdoc
     */
    canActivate(route : ActivatedRouteSnapshot, state : RouterStateSnapshot) :Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        let feature : FeatureData = route.data['feature']

        return feature.enabled == true
    }
}
