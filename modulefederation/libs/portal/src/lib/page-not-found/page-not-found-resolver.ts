import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";

@Injectable({
    providedIn: 'root'
})
export class PathResolveService implements Resolve<string | null> {
    resolve(
        route : ActivatedRouteSnapshot,
        state : RouterStateSnapshot
    ) : string | null {
        return state.url.replace('/', '');
    }
}
