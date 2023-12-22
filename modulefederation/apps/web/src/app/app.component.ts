import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NullValidationHandler, OAuthService } from 'angular-oauth2-oidc';
import { authConfig } from './auth.config';
import { Environment } from "@modulefederation/portal";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // public

  constructor(private router : Router, private oauthService : OAuthService, private environment : Environment) {
    this.configure();
  }

  // constructor

  public login() {
    this.oauthService.initLoginFlow();
  }

  public logout() {
    this.oauthService.logOut();
  }

  // private

  private configure() {
    // adjust configuration

    authConfig.issuer = this.environment.get<string>("oauth.server") + '/realms/' + this.environment.get<string>("oauth.client"),
      authConfig.scope += " " + this.environment.get<string>("oauth.scopes", "")

    // tell oauth

    this.oauthService.configure(authConfig);
    this.oauthService.tokenValidationHandler = new NullValidationHandler();
    this.oauthService.loadDiscoveryDocumentAndTryLogin();
    this.oauthService.setupAutomaticSilentRefresh();

    // subscribe to events

    this.oauthService.events.subscribe((e) => {
      switch (e.type) {
        case "token_received":
          this.checkRedirect();
          break;

        default:
          ;
      }
    });
  }

  // implement OnInit

  private checkRedirect() {
    if (this.oauthService.state!!.length > 0) {
      let url = decodeURIComponent(this.oauthService.state!!);

      this.oauthService.state = ""

      this.router.navigateByUrl(url);
    }
  }
}
