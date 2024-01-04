import { FatalError } from "./fatal-error";

/**
 * a fatal communication error ( e.g. that has not reached the server yet )
 */
export class CommunicationError extends FatalError {
   // constructor

    constructor(message : string, cause?: Error) {
        super(message, cause);
    }
}
