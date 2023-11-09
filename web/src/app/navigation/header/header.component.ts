import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import { filter, map, switchMap } from 'rxjs';
import { AppComponent } from 'src/app/app.component';

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
  user = undefined
  
  // constructor

  constructor(public app: AppComponent, private router: Router, private activatedRoute: ActivatedRoute, private oauthService: OAuthService) { 
    // subscribe to events

    oauthService.events.subscribe((e) => {
        // console.debug('oauth/oidc event', e);
        switch ( e.type ) {
          case "token_received":
            this.onTokenReceived()
            break;

          case "logout":
            this.onLogout()
            break;

          default:
        }
      });

      // check initial status

      if ( oauthService.hasValidAccessToken()) {
        this.onTokenReceived()
      }  
  }

 // callbacks

  onTokenReceived() {
    this.loggedIn = true;

    this.oauthService.loadUserProfile().then((user) => 
      this.user = user['info']
    );

    //const scopes = this.oauthService.getGrantedScopes(); // see config object
  }
     
  onLogout() {
    this.loggedIn = false;
    this.user = undefined;
  }


  // public

  public login() {
    this.oauthService.initLoginFlow();
  }
  
  public logout() {
    this.oauthService.logOut();
  }

  // public

  public onToggleSidenav = () => {
    this.sidenavToggle.emit();
  }

  // implement OnInit

  ngOnInit(): void {
     // listen to router events

      this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map(route => route.firstChild),
        switchMap(route => (route as any).data),
        //map(data => data['label'])
         )
        .subscribe(data => {
           this.label = data['label']
           this.icon = data['icon']
        });
    }
  }
