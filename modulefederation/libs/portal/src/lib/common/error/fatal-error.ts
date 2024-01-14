/**
 * any unexpected error
 */
export class FatalError extends Error {
  // constructor

    constructor(message : string, cause?: Error) {
        super(message, {cause: cause});

        if ( cause?.stack )
          this.stack = cause.stack
    }
}
