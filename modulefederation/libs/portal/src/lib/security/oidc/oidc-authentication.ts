import { Injectable } from "@angular/core";

import { throwError } from "rxjs";
import { OIDCUser } from "./oidc-user";
import { AuthenticationRequest } from "../authentication-request.interface";
import { Authentication } from "../authentication";
import { Ticket } from "../ticket.interface";
import { OIDCTicket } from "./oidc-session-manager";

@Injectable({providedIn: 'root'})
export class OIDCAuthentication implements Authentication<OIDCUser, OIDCTicket> {
  // constructor

  constructor() {
  }

  // implement Authentication

  authenticate(request : AuthenticationRequest) {
      return throwError(new Error('authentication failed'));
  }
}
