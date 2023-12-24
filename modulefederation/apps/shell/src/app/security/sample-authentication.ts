import { Authentication, AuthenticationRequest, Ticket } from "@modulefederation/portal";
import { Injectable } from "@angular/core";
import { of, throwError } from "rxjs";

interface SampleUser {
    permissions : string[];
}

@Injectable({providedIn: 'root'})
export class SampleAuthentication implements Authentication<SampleUser, Ticket> {
    authenticate(request : AuthenticationRequest) {
        const {user, password} = request;
        if ((user === 'admin' && password === 'admin') || (user === 'guest' && password === 'guest')) {
            return of({
                user: {account: request.user, permissions: [request.user]},
                ticket: {}
            });
        }
        else {
            return throwError(new Error('authentication failed'));
        }
    }
}
