import { FatalError } from "./fatal-error";

export class ServerError extends FatalError {
    constructor(public clazz : string, message : string) {
        super(message);

        // Set the prototype explicitly.
        //Object.setPrototypeOf(this, FooError.prototype);
    }
}
