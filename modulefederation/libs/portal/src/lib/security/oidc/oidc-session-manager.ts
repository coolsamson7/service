import { Inject, Injectable } from "@angular/core";
import { OIDCUser } from "./oidc-user";
import { AuthConfig, NullValidationHandler, OAuthService } from "angular-oauth2-oidc";
import { OIDCAuthentication } from "./oidc-authentication";
import { SessionManager } from "../session-manager";
import { Ticket } from "../ticket.interface";
import { OIDCModuleConfig, OIDCModuleConfigToken } from "./oidc-module";
import { Router } from "@angular/router";
import { Environment } from "../../common/util/environment.service";

export interface OIDCTicket extends Ticket {
    token : string
    refreshToken : string
}

@Injectable({providedIn: 'root'})
export class OIDCSessionManager extends SessionManager<OIDCUser, OIDCTicket> {
    // constructor

    constructor(@Inject(OIDCModuleConfigToken) oidcConfig : OIDCModuleConfig, private environment: Environment, private router : Router, private oauthService : OAuthService, authentication : OIDCAuthentication) {
        super(authentication);

        this.configure(oidcConfig.authConfig)

        // subscribe to events

        oauthService.events.subscribe((e) => {
            console.debug('oauth/oidc event', e);

            switch (e.type) {
                case "discovery_document_loaded":
                    if (!this.hasSession() && oauthService.hasValidAccessToken())
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

    private configure(authConfig : AuthConfig) {
        // adjust configuration TODO

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

    // public

    public override login() {
        this.oauthService.initLoginFlow();
    }

    public override logout() {
        this.oauthService.logOut();
    }

    // private

    onTokenReceived() {
        this.loadUser();

        //const scopes = this.oauthService.getGrantedScopes(); // see config object
    }

    onLogout() {
        this.closeSession()
    }

    private loadUser() {
        this.oauthService.loadUserProfile().then((user : any) =>
            this.setSession({
                user: user['info'],
                ticket: {
                    token: this.oauthService.getAccessToken(),
                    refreshToken: this.oauthService.getRefreshToken()
                }
            }))
    }
}
