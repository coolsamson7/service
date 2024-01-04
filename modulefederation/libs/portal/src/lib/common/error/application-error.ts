/**
 * an expected server side error (e.g. that is part of the signature )
 */
export class ApplicationError extends Error {
  // constructor

  constructor(public clazz : string, message : string, cause? : Error) {
    super(message, {cause: cause});

    if (cause)
      this.stack = cause.stack
  }
}
