/**
 * exceptions thrown by the authentication system
 */
export class AuthenticationException extends Error {
    // constructor

  constructor(user: string, reason: string) {
    super('failed authentication for ' + user + ', reason: ' + reason);
  }
}
