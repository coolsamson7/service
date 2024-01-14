/* eslint-disable @typescript-eslint/ban-types */
import { CommandConfig } from './command-config';
import { Injectable, InjectFlags, Injector } from '@angular/core';
import { TraceLevel, Tracer } from '../tracer';
import { CommandDescriptor } from './command-descriptor';
import { CommandModuleConfig, CommandConfigToken } from './command.module';
import { Commands } from './commands';
import { AbstractCommandInterceptor, CommandInterceptor } from './command-interceptor';
import { ExecutionContext } from './execution-context';

/**
 * this interceptor is there to set and restore the current execution context
 */
@Injectable({ providedIn: 'root' })
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

  private commandConfig: CommandModuleConfig;

  // constructor

  constructor(private injector: Injector) {
    this.commandConfig = injector.get(CommandConfigToken, undefined, InjectFlags.Optional) || {
      interceptors: []
    };
  }

  // public

  /**
   * create a {@link Command}
   * @param commandConfig the command config
   * @param controller the controller
   */
  public createCommand(commandConfig: CommandConfig, commands: Commands): CommandDescriptor {
    if (Tracer.ENABLED)
      Tracer.Trace('commands', TraceLevel.HIGH, 'create command {0}', commandConfig.command);

    // what about i18n

    if (commandConfig.i18n) {
      // TODO!!!!
      // we also need a 'type' property
      // e.g. bl.tooltip vs bla.label vs. bla.speech
    }

    // create command

    const command = new CommandDescriptor(commands, commandConfig);

    // set some data

    command.commands = commands;

    // push/pop context

    command.interceptors.push(this.injector.get(CommandContextInterceptor));

    // set static interceptors

    command.interceptors.push(...this.commandConfig.interceptors.map((type) => this.injector.get(type)));

    // add command interceptors

    command.interceptors.push(...commands.addCommandInterceptors(commandConfig));

    // add function call

    command.interceptors.push(new CommandCallFunctionInterceptor(commandConfig.action  as Function));

    // done

    return command;
  }
}
