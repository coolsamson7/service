
import { Component, Injectable, OnInit } from '@angular/core';
import { Portal, PortalElement } from './navigation/navigation.interface';
import { Router } from '@angular/router';
import { EndpointLocator } from './common/communication/endpoint-locator';
import { OAuthService, NullValidationHandler, AuthConfig } from 'angular-oauth2-oidc';
import { JwksValidationHandler } from 'angular-oauth2-oidc';

import { environment } from '../environments/environment';
import { authConfig } from './auth.config';
import { filter } from 'rxjs';

@Injectable({providedIn: "root"})
export class ApplicationEndpointLocator extends EndpointLocator {
  // constructor

  constructor() {
    super()

    let url = window.location.href;
    console.log(url)
  }

  // implement 

  getEndpoint(domain: string): string {
    if ( domain == "admin")
      return environment.adminServer//'http://localhost:8080'
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

   // instance data

  
  selection: PortalElement = this.portal.items[0] // home

  // public

  navigate(element: PortalElement) {
      this.selection = element
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

    this.oauthService.events.subscribe((e) => {
      // tslint:disable-next-line:no-console
      console.debug('oauth/oidc event', e);
    });
    
    this.oauthService.events
    .pipe(
      filter((e) => e.type === 'token_received'))
      .subscribe((_) => {
        console.debug('state', this.oauthService.state);

        this.oauthService.loadUserProfile().then(user => console.log(user));

        const scopes = this.oauthService.getGrantedScopes();
        console.debug('scopes', scopes);
      });
  }

  // implement OnInit

  ngOnInit(): void {
  }
}
