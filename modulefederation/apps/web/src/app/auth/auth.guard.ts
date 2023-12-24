import { Injectable, ModuleWithProviders, NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';

@Injectable()
export class AuthGuard implements CanActivate {
    // constructor

    constructor(private router : Router, private oauthService : OAuthService) {
    }

    // implement CanActivate

    canActivate(route : ActivatedRouteSnapshot, state : RouterStateSnapshot) {
        if (this.oauthService.hasValidAccessToken() && this.oauthService.hasValidIdToken()) {
            return true;
        }
        else {
            this.oauthService.initLoginFlow(state.url) // fetch it from state in the app component!

            return false;
        }
    }
}

@NgModule({
    imports: [],
    providers: [],
    declarations: [],
    exports: [],
})
export class SharedModule {
    static forRoot() : ModuleWithProviders<SharedModule> {
        return {
            providers: [AuthGuard],
            ngModule: SharedModule,
        };
    }
}
