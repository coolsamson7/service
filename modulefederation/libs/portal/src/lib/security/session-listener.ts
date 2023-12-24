import { Session } from "./session.interface";

/**
 * a listener for session events.
 */
export interface SessionListener<S extends Session> {
    /**
     * the session is about to be created
     */
    opening(session : S) : void;

    /**
     * the session has been opened
     * @param session the session
     */
    opened(session : S) : void;

    /**
     * the session is about to be closed
     * @param session the session
     */
    closing(session : S) : void;

    /**
     * the session has been closed
     * @param session the session
     */
    closed(session : S) : void;
}
