import { Session } from "./session.interface";
import { User } from "./user.interface";
import { Ticket } from "./ticket.interface";

/**
 * a listener for session events.
 */
export interface SessionListener {
    /**
     * the session is about to be created
     */
    opening(session: Session<User, Ticket>): void;

    /**
     * the session has been opened
     * @param session the session
     */
    opened(session: Session<User, Ticket>): void;

    /**
     * the session is about to be closed
     * @param session the session
     */
    closing(session: Session<User, Ticket>): void;

    /**
     * the session has been closed
     * @param session the session
     */
    closed(session: Session<User, Ticket>): void;
}
