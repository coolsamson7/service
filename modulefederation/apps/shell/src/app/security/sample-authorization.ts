import { Injectable } from "@angular/core";
import { Authorization, SessionManager } from "@modulefederation/portal";

@Injectable({providedIn: 'root'})
export class SampleAuthorization implements Authorization {
  // implement Authorization

  constructor(private session : SessionManager) {
  }

  /**
   * @inheritdoc
   */
  hasPermission(permission : string) : boolean {
    return true//this.session.getUser()?.permissions.includes(permission);
  }
}
