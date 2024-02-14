import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable, of } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class CanDeactivateGuard implements CanDeactivate<any> {
    // implement CanDeactivate

    /**
     * @inheritdoc
     */
    canDeactivate(
        component : any,
        currentRoute : ActivatedRouteSnapshot,
        currentState : RouterStateSnapshot,
        nextState? : RouterStateSnapshot
    ) : Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        const feature = currentRoute.data['feature']

        if (component && component['canDeactivate'])
            return component.canDeactivate()
        else
            return of(true)
    }
}
