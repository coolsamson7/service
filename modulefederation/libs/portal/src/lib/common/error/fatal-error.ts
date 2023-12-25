export class FatalError extends Error {
    constructor(message : string) {
        super(message);

        // Set the prototype explicitly.
        //Object.setPrototypeOf(this, FooError.prototype);
    }
}
