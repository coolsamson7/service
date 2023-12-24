import { Injectable } from "@angular/core";
import { OIDCUser } from "./oidc-user";
import { OAuthService } from "angular-oauth2-oidc";
import { OIDCAuthentication } from "./oidc-authentication";
import { SessionManager } from "../session-manager";
import { Ticket } from "../ticket.interface";

export interface OIDCTicket extends Ticket {
    token : string
    refreshToken : string
}

@Injectable({providedIn: 'root'})
export class OIDCSessionManager extends SessionManager<OIDCUser, OIDCTicket> {
    // constructor

    constructor(private oauthService : OAuthService, authentication : OIDCAuthentication) {
        super(authentication);

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
