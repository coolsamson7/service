import { Injectable } from '@angular/core';
import { AbstractCommandInterceptor } from './command-interceptor';
import { ExecutionContext } from './execution-context';
import { ErrorManager } from '../common/error';

/**
 * A {@link CommandInterceptor} that will intercept errors and delegate them to the {@link ErrorManager}
 */
@Injectable({ providedIn: 'root' })
export class CommandErrorInterceptor extends AbstractCommandInterceptor {
  // constructor

  constructor(private errorManager: ErrorManager) {
    super();
  }

  // implement CommandInterceptor

  /**
   * @inheritdoc
   */
  override onCall(executionContext: ExecutionContext): void {
    this.errorManager.pushContext({
      $type: 'command',
      command: executionContext.command
    });
  }

  /**
   * @inheritdoc
   */
  override onResult(executionContext: ExecutionContext): void {
    this.errorManager.popContext();
  }

  /**
   * @inheritdoc
   */
  override onError(context: ExecutionContext): void {
    try {
      this.errorManager.handle(context.error);
    } 
    finally {
      this.errorManager.popContext();
    }
  }
}
