import { Authentication, AuthenticationRequest, Ticket, User } from "@modulefederation/portal";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { of, throwError } from "rxjs";

interface SampleUser extends User {
    permissions: string[];
}

@Injectable({ providedIn: 'root' })
export class SampleAuthentication implements Authentication<SampleUser, Ticket> {
    // constructor
    constructor(private http: HttpClient) {}

    authenticate(request: AuthenticationRequest) {
        const { user, password } = request;
        if ((user === 'admin' && password === 'admin') || (user === 'guest' && password === 'guest')) {
            return of({
                user: { account: request.user, permissions: [request.user] },
                ticket: {}
            });
        }
        else {
            return throwError(new Error('authentication failed'));
        }
    }
}
