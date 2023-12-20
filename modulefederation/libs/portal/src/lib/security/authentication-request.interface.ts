/**
 * an authentication request consisting of - at least - the user and password
 */
export interface AuthenticationRequest {
  /**
   * the user name
   */
  user : string;
  /**
   * the password
   */
  password : string;

  /**
   * any other parameters
   */
  [prop : string] : any;
}
