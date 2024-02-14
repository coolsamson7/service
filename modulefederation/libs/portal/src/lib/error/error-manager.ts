import { Constructor } from "../common/lang/constructor.type"
import { TraceLevel, Tracer } from "../tracer"
import { ErrorContext } from "./error-context"
import { Injectable } from "@angular/core";
import { TypeDescriptor } from "../reflection";
import { HandleError } from "./error.decorator";

/**
 * @internal
 */
interface Entry {
  type : Constructor<unknown>
  instance : unknown
  handler : Function
  next? : Entry
}

/**
 * <code>ErrorManager</code> is responsible to handle errors by delegating to registered methods which match the error type.
 */
@Injectable({providedIn: 'root'})
export class ErrorManager {
  // instance data

  private cache : { [name : string] : Entry } = {}
  private currentContext : ErrorContext | undefined

  // private

  private defaultErrorHandler(e : Error) {
    console.log(e)

    return e
  }

  private find(clazz : any) : Entry | undefined {
    if (!clazz) return undefined

    let entry = this.cache[clazz.name]
    if (!entry) {
      const parent = this.findNextMatch(Object.getPrototypeOf(clazz))

      if (parent)
        this.register(
          (entry = {
            type: clazz,
            instance: parent.instance || undefined,
            handler: parent.handler || undefined,
            next: parent,
          })
        )
    } // if

    return entry
  }

  private findNextMatch(clazz : Constructor<unknown>) : Entry | undefined {
    let entry = this.find(clazz)
    while (!entry && clazz && clazz?.name) entry = this.find((clazz = Object.getPrototypeOf(clazz)))

    return entry
  }

  private register(entry : Entry) {
    this.cache[entry.type.name] = entry
  }

  // public

  /**
   * Handle an error by calling the appropriate error handler.
   * This method will mark the error as handled in order to avoid double handling.
   * @param error the error to be handled
   * @param errorContext an optional context.
   * @return error the error for further actions
   */
  public handle(error : any, errorContext? : ErrorContext) : any {
    if (error.$handled) return error

    // a string will complain...

    if (typeof error == "object") error.$handled = true

    if (Tracer.ENABLED)
      Tracer.Trace("error", TraceLevel.FULL, "handle error {0}", error.name)

    let entry = this.find(error.constructor)
    if (!entry) {
      // either the inheritance trick didn't work, or there is no handler...

      entry = this.find(Error)
      if (entry) {
        this.register({
          type: error.constructor,
          instance: entry.instance,
          handler: entry.handler,
        })
      }
      else {
        this.register(
          (entry = {
            type: error.constructor,
            instance: this,
            handler: this.defaultErrorHandler,
          })
        )
      }
    }

    return entry.handler.apply(entry.instance, [error, errorContext || this.currentContext])
  }

  /**
   * @internal
   */
  public registerHandler(handler : any) {
    const type = TypeDescriptor.forType(handler.constructor)

    const handlers = type.getMethods().filter(method => method.hasDecorator(HandleError))

    for (const method of handlers) { //method.method.
      this.register({
        type: method.paramTypes[0],
        instance: handler,
        handler: method.method,
      })
    } // for
  }

  // public

  /**
   * clear the current context
   */
  clearContext() : ErrorContext | undefined {
    if (Tracer.ENABLED) Tracer.Trace("error", TraceLevel.FULL, "clear context")

    try {
      return this.currentContext
    }
    finally {
      this.currentContext = undefined
    }
  }

  /**
   * return the current context
   */
  context() : ErrorContext | undefined {
    return this.currentContext
  }

  /**
   * push a new context and chain it to the current context
   * @param context the context
   */
  pushContext(context : ErrorContext) : ErrorContext {
    if (Tracer.ENABLED) Tracer.Trace("error", TraceLevel.FULL, "push context")

    context.$next = this.currentContext

    return (this.currentContext = context)
  }

  /**
   * set a new context.
   * @param context
   */
  setContext(context : ErrorContext) : ErrorContext {
    if (Tracer.ENABLED) Tracer.Trace("error", TraceLevel.FULL, "set context")

    return (this.currentContext = context)
  }

  /**
   * pop the current context and set the parent as the current.
   */
  popContext() {
    if (Tracer.ENABLED) Tracer.Trace("error", TraceLevel.FULL, "pop context")

    try {
      return this.currentContext
    }
    finally {
      this.currentContext = this.currentContext?.$next
    }
  }
}
