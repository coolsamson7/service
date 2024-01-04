import { FatalError } from "./fatal-error";

/**
 * a fatal error caused by the server side
 */
export class ServerError extends FatalError {
  // constructor

    constructor(public clazz : string, message : string, cause?: Error) {
        super(message, cause);
    }
}
