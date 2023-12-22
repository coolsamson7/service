import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import { filter, map, switchMap } from 'rxjs';
import { AppComponent } from "../../app.component";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  // output

  @Output() public sidenavToggle = new EventEmitter();
  label = ""
  icon = ""
  loggedIn = false
  user : any = undefined

  // constructor

  constructor(public app : AppComponent, private router : Router, private activatedRoute : ActivatedRoute, private oauthService : OAuthService) {
    // check initial status

    this.loggedIn = oauthService.hasValidAccessToken()

    // subscribe to events

    oauthService.events.subscribe((e) => {
      // console.debug('oauth/oidc event', e);
      switch (e.type) {
        case "discovery_document_loaded":
          if (this.user == undefined && oauthService.hasValidAccessToken())
            this.loadUser();
          break;

        case "token_received":
          this.onTokenReceived()
          break;

        case "logout":
          this.onLogout()
          break;

        default:
      }
    });
  }

  // private

  onTokenReceived() {
    this.loggedIn = true;

    this.loadUser();

    //const scopes = this.oauthService.getGrantedScopes(); // see config object
  }

  // callbacks

  onLogout() {
    this.loggedIn = false;
    this.user = undefined;
  }

  public login() {
    this.oauthService.initLoginFlow();
  }


  // public

  public logout() {
    this.oauthService.logOut();
  }

  public onToggleSidenav = () => {
    this.sidenavToggle.emit();
  }

  // public

  ngOnInit() : void {
    // listen to router events

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map(route => route.firstChild),
        switchMap(route => (route as any).data),
        //map(data => data['label'])
      )
      .subscribe((data : any) => {
        this.label = data['label']
        this.icon = data['icon']
      });
  }

  // implement OnInit

  private loadUser() {
    this.oauthService.loadUserProfile().then((user : any) =>
      this.user = user['info']
    );
  }
}
