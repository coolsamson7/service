/* eslint-disable @typescript-eslint/ban-types */
import { CommandConfig } from './command-config';
import { Injectable, InjectFlags, Injector } from '@angular/core';
import { TraceLevel, Tracer } from '../tracer';
import { CommandDescriptor } from './command-descriptor';
import { CommandConfigToken } from './command.module';
import { AbstractCommandInterceptor, CommandInterceptor } from './command-interceptor';
import { ExecutionContext } from './execution-context';
import { CommandAdministration } from './with-commands.mixin';

/**
 * this interceptor is there to set and restore the current execution context
 */
export class CommandContextInterceptor implements CommandInterceptor {
  // implement CommandInterceptor

  /**
   * @inheritdoc
   */
  onCall(executionContext: ExecutionContext): void {
    executionContext.running = true;

    executionContext.commands.pushExecutionContext(executionContext);
  }

  /**
   * @inheritdoc
   */
  onResult(executionContext: ExecutionContext): void {
    executionContext.running = false;

    executionContext.commands.popExecutionContext(executionContext);
  }

  /**
   * @inheritdoc
   */
  onError(executionContext: ExecutionContext): void {
    executionContext.running = false;

    executionContext.commands.popExecutionContext(executionContext);
  }
}

/**
 * this is an internal interceptor that will call the command method
 */
export class CommandCallFunctionInterceptor extends AbstractCommandInterceptor {
    // constructor
  
    constructor(private call: Function) {
      super();
    }
  
    // implement CommandInterceptor
  
    /**
     * @inheritdoc
     */
    override onCall(context: ExecutionContext) {
      const previousContext = context.commands.currentExecutionContext;
      context.commands.currentExecutionContext = context;

      try {
        context.result = this.call.apply(context.commands, context.args);
      } 
      finally {
        context.commands.currentExecutionContext = previousContext;
      }
    }
  }
  

/**
 * A <code>CommandFactory</code> is used to create a {@link Command} given a configuration object.
 * It will create all necessary interceptors based on the central configuration and the corresponding controller.
 */
@Injectable({ providedIn: 'root' })
export class CommandFactory {
  // instance data

  private interceptors: CommandInterceptor[]

  // constructor

  constructor(private injector: Injector) {
    this.interceptors = [
        new CommandContextInterceptor(),
        ...injector.get(CommandConfigToken, {  interceptors: [] }, InjectFlags.Optional) .interceptors.map(type => this.injector.get(type))
    ]
  }

  // public

  /**
   * create a {@link Command}
   * @param commandConfig the command config
   * @param controller the controller
   */
  public createCommand(commandConfig: CommandConfig, commands: CommandAdministration): CommandDescriptor {
    if (Tracer.ENABLED)
      Tracer.Trace('commands', TraceLevel.HIGH, 'create command {0}', commandConfig.command);

    // create command

    const command = new CommandDescriptor(commands, commandConfig);

    // set some data

    command.commands = commands;

    // set static interceptors

    command.interceptors.push(...this.interceptors);

    // add command interceptors from manager

    commands.addCommandInterceptors(commandConfig, command.interceptors);

    // add method call

    command.interceptors.push(new CommandCallFunctionInterceptor(commandConfig.action  as Function));

    // done

    return command;
  }
}
