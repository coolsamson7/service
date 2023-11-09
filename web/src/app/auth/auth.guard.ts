import { Injectable, ModuleWithProviders, NgModule } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';

@Injectable()
export class AuthGuard implements CanActivate {
    // constructor

  constructor(private router: Router, private oauthService: OAuthService) {}


  // implement CanActivate

  canActivate() {
    if (this.oauthService.hasValidAccessToken() && this.oauthService.hasValidIdToken() ) {
      return true;
    } 
    else {
        //this.oauthService.tryLogin()
        this.router.navigate(['/home', { login: true }]);

      return false;
    }
  }
}

@NgModule({
  imports: [
  ],
  providers: [],
  declarations: [

  ],
  exports: [

  ],
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      providers: [AuthGuard],
      ngModule: SharedModule,
    };
  }
}