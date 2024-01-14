import { ExecutionContext } from "./execution-context";

/**
 * A <code>CommandInterceptor</code> is part of a chain of interceptors and can add execution logic as part of a command execution.
 */
export interface CommandInterceptor {
    /**
     * called prior to method execution
     * @param executionContext  {@link ExecutionContext} the current execution context
     */
    onCall(executionContext: ExecutionContext): void;
    /**
     * called after a result has been computed
     * @param executionContext  {@link ExecutionContext} the current execution context
     */
    onResult(executionContext: ExecutionContext): void;
    /**
     * called after an exception has been caught
     * @param executionContext  {@link ExecutionContext} the current execution context
     */
    onError(executionContext: ExecutionContext): void;
  }
  
  /**
   * an abstract base class for interceptors. All methods are empty.
   */
  export class AbstractCommandInterceptor implements CommandInterceptor {
    // implement CommandInterceptor
  
    /**
     * @inheritdoc
     */
    onCall(executionContext: ExecutionContext): void {}
  
    /**
     * @inheritdoc
     */
    onError(executionContext: ExecutionContext): void {}
  
    /**
     * @inheritdoc
     */
    onResult(executionContext: ExecutionContext): void {}
  }