
import { Component, Injectable, OnInit } from '@angular/core';
import { Portal, PortalElement } from './navigation/navigation.interface';
import { Router } from '@angular/router';
import { EndpointLocator } from './common/communication/endpoint-locator';
import { OAuthService, NullValidationHandler } from 'angular-oauth2-oidc';

import { environment } from '../environments/environment';
import { authConfig } from './auth.config';
import { Environment } from './common/util/environment.service';

@Injectable({providedIn: "root"})
export class ApplicationEndpointLocator extends EndpointLocator {
  // constructor

  constructor(private environment: Environment) {
    super()
  }

  // implement 

  getEndpoint(domain: string): string {
    if ( domain == "admin")
      return this.environment.get<string>("administration.server", 'http://localhost:8080');
    else
       throw new Error("unknown domain " + domain)
  }
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  // instance data

 portal: Portal = {
    items: [
      {
       label: "Home",
       route: "/home",
       icon: "home"      
      },
      {
        label: "Components",
        route: "/components",
        icon: "folder"      
       },
       {
        label: "Nodes",
        route: "/nodes",
        icon: "computer"      
       }
    ]
  }

  // public

  navigate(element: PortalElement) {
      this.router.navigate([element.route])
  }

  // constructor

  constructor(private router: Router, private oauthService: OAuthService) {
    this.configure();
  }


  public login() {
    this.oauthService.initLoginFlow();
  }
  
  public logout() {
    this.oauthService.logOut();
  }
  
  private configure() {
    this.oauthService.configure(authConfig);
    this.oauthService.tokenValidationHandler = new  NullValidationHandler();
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

  // private

  private checkRedirect() {
    if (this.oauthService.state?.length > 0) {
      let url = decodeURIComponent(this.oauthService.state);

      this.oauthService.state = ""

      this.router.navigateByUrl(url);
    }
  }

  // implement OnInit

  ngOnInit(): void {
  }
}
