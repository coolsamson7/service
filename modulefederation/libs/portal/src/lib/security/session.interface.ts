import { Ticket } from "./ticket.interface";

/**
 * a session captures the current user information and any related ticket information ( e.g. JWT, ... ) coming from the underlying
 * authentication system.
 */
export interface Session<U = any, T extends Ticket = Ticket> {
    /**
     * the user object
     */
    user : U;
    /**
     * the ticket
     */
    ticket : T;
    /**
     * the session expiry in ms.
     */
    expiry? : number;

    /**
     * the session locale
     */
    locale? : string;

    /**
     * any other properties
     */
    [prop : string] : any;
}
