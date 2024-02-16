import { Injectable } from "@angular/core";
import { Authorization, SessionManager, Ticket } from "@modulefederation/portal";

@Injectable({providedIn: 'root'})
export class SampleAuthorization implements Authorization {
    // constructor

    constructor(private session : SessionManager<any, Ticket>) {
    }

    // implement Authorization

    /**
     * @inheritdoc
     */
    hasPermission(permission : string) : boolean {
        return true
    }
}
