import { Observable, throwError } from 'rxjs';
import { Ticket } from "./ticket.interface";
import { Session } from "./session.interface";
import { AuthenticationException } from "./security.error";
import { AuthenticationRequest } from "./authentication-request.interface";


/**
 * this interface covers the main authentication method.
 */
export class Authentication<U = any, T = Ticket> {
  /**
   * return a combination of a user and ticket related to the specified authentication request.
   * @param request the authentication request
   */
  authenticate(request : AuthenticationRequest) : Observable<Session<U, T>> {
    return throwError(new AuthenticationException(request.user, 'no authentication configured'));
  }
}
