import { Inject, Injectable } from "@angular/core";
import { OIDCUser } from "./oidc-user";
import { AuthConfig, NullValidationHandler, OAuthService } from "angular-oauth2-oidc";
import { OIDCAuthentication } from "./oidc-authentication";
import { SessionManager } from "../session-manager";
import { Ticket } from "../ticket.interface";
import { OIDCModuleConfig, OIDCModuleConfigToken } from "./oidc-module";
import { Router } from "@angular/router";
import { Environment } from "../../common/util/environment.service";
import { Tracer, TraceLevel } from "../../tracer";

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
            if ( Tracer.ENABLED)
                Tracer.Trace("session.oidc", TraceLevel.FULL, "handle event {0}", e.type)

            switch (e.type) {
                case "discovery_document_loaded":
                    this.ready$.next(true)

                    if (!this.hasSession() && oauthService.hasValidAccessToken())
                        this.loadUser();
                    break;

                case "token_received":
                    this.checkRedirect()
                    this.onTokenReceived()
                    break;

                case "logout":
                    this.onLogout()
                    break;

                default:
            }
        });
    }

    override start() {
        if ( Tracer.ENABLED)
            Tracer.Trace("session.oidc", TraceLevel.FULL, "startup oidc session manager")

        this.oauthService.loadDiscoveryDocumentAndTryLogin().then(result => {
            //if (this.oauthService.hasValidAccessToken())
                //this.loadUser();
        })
    }

    private configure(authConfig : AuthConfig) {
        // adjust configuration TODO

        authConfig.issuer = this.environment.get<string>("oauth.server") + "/realms/" + this.environment.get<string>("oauth.client"),
            authConfig.scope += " " + this.environment.get<string>("oauth.scopes", "")

        // tell oauth

        this.oauthService.configure(authConfig);
        this.oauthService.tokenValidationHandler = new NullValidationHandler();
        this.oauthService.setupAutomaticSilentRefresh()
    }

    private checkRedirect() {
        if (this.oauthService.state!.length > 0) {
            let url = decodeURIComponent(this.oauthService.state!);

            if ( Tracer.ENABLED)
                Tracer.Trace("session.oidc", TraceLevel.HIGH, "redirect to {0}", url)

            this.oauthService.state = ""

            this.router.navigateByUrl(url);
        }
    }

    private onTokenReceived() {
        this.loadUser()
        this.checkRedirect()
    }

    private onLogout() {
        this.closeSession()
    }

    private loadUser() {
        if ( Tracer.ENABLED)
            Tracer.Trace("session.oidc", TraceLevel.FULL, "load user profile")

        this.oauthService.loadUserProfile().then((user : any) =>
            this.setSession({
                user: user['info'],
                ticket: {
                    token: this.oauthService.getAccessToken(),
                    refreshToken: this.oauthService.getRefreshToken()
                }
            }))
    }

    // public

    public override login() {
        if ( Tracer.ENABLED)
           Tracer.Trace("session.oidc", TraceLevel.HIGH, "login")

        this.oauthService.initLoginFlow();
    }

    public override logout() {
        if ( Tracer.ENABLED)
           Tracer.Trace("session.oidc", TraceLevel.HIGH, "logout")

        this.oauthService.logOut();
    }
}
