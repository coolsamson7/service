export class FatalError extends Error {
    constructor(message : string) {
        super(message);

        // Set the prototype explicitly.
        //Object.setPrototypeOf(this, FooError.prototype);
    }
}


export class ServerError extends Error {
    constructor(public clazz : string, message : string) {
        super(message);

        // Set the prototype explicitly.
        //Object.setPrototypeOf(this, FooError.prototype);
    }
}

export class CommunicationError extends Error {
    constructor(message : string) {
        super(message);

        // Set the prototype explicitly.
        //Object.setPrototypeOf(this, FooError.prototype);
    }
}

export class ApplicationError extends Error {
    constructor(public clazz : string, message : string) {
        super(message);

        // Set the prototype explicitly.
        //Object.setPrototypeOf(this, FooError.prototype);
    }
}
