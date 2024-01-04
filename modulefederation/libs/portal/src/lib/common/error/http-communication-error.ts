import { CommunicationError } from "./communication-error";

/**
 * a fatal http communication error ( e.g. that has not reached the server yet )
 */
export class HTTPCommunicationError extends CommunicationError {
  // constructor

  constructor(status: number, message : string, cause?: Error) {
    super(message, cause);
  }
}
