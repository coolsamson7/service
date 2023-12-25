import { FatalError } from "./fatal-error";

export class CommunicationError extends FatalError {
    constructor(message : string) {
        super(message);

        // Set the prototype explicitly.
        //Object.setPrototypeOf(this, FooError.prototype);
    }
}
