/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { TraceLevel, Tracer } from "../tracer";
import { CommandConfig } from "./command-config";
import { CommandInterceptor } from "./command-interceptor";
import { Commands } from "./commands";
import { ExecutionContext } from "./execution-context";

/**
 * a <code>CommandListener</code> can be used in order to be informed about success or failure of a command execution.
 */
export interface CommandListener {
    /**
     * called when the command has returned a value
     * @param command the command
     * @param result the result
     */
    onResult(command: CommandDescriptor, result: any) : void

    /**
     * called when the command has returned an error
     * @param command the command
     * @param error the error
     */
    onError(command: CommandDescriptor, error: any) : void
}

export class CommandDescriptor {
    // instance data

    name: string
    group?: string;
    label?: string;
    shortCut?: string;
    icon?: string;
    enabled: boolean;
    i18n?: string;

    commands: Commands; // the declaring container

    superCommand?: CommandDescriptor;
    interceptors: CommandInterceptor[] = [];
    listeners: CommandListener[] = [];

    // constructor

    constructor(commands: Commands, config: CommandConfig) {
      this.commands = commands
      this.name = config.command!;
      this.group = config.group;
      this.icon = config.icon;
      this.label = config.label ? config.label : config.command;
      this.shortCut = config.shortCut;
      this.enabled = config.enabled ? config.enabled : true;
      this.i18n = config.i18n;
    }

    // public

    addListener(listener: CommandListener) {
      if (!this.listeners) this.listeners = [listener];
      else this.listeners.push(listener);
    }

    onResult(result: any): void {
      if (Tracer.ENABLED) Tracer.Trace('command', TraceLevel.FULL, 'command on result {0}', result);

      if (this.listeners) for (const listener of this.listeners) listener.onResult(this, result);
    }

    onError(error: any): void {
      if (Tracer.ENABLED) Tracer.Trace('command', TraceLevel.FULL, 'command on error {0}', error);

      if (this.listeners) for (const listener of this.listeners) listener.onError(this, error);
    }

    /**
     * run the command by executing all interceptors.
     * @param args the command arguments
     */
    run(...args: any[]): Promise<any> {
      if (Tracer.ENABLED) Tracer.Trace('command', TraceLevel.FULL, 'run command {0}', this.name);

      // create context

      const context = new ExecutionContext(this, this.commands, args);

      // run the "onCall" pipeline, the last interceptor is the function call

      let index = 0;

      try {
        for (; index < this.interceptors.length; index++)
            this.interceptors[index].onCall(context);
      }
      catch (error) {
        context.error = error;

        // run the "onError" pipeline in reverse order

        while (index >= 0)
            this.interceptors[index--].onError(context);

        // call listeners

        this.onError(context.error);

        return Promise.reject(error);
      }

      // now we have an object or a promise...

      index = this.interceptors.length - 1;

      return Promise.resolve(context.result) // start with the initial result
        .then((result) => {
          context.result = result;

          // run the "onResult" pipeline in reverse order

          while (index >= 0)
           this.interceptors[index--].onResult(context);

          // call listeners

          this.onResult(context.result);

          return context.result;
        })
        .catch((error) => {
          context.error = error;

          // run the "onError" pipeline in reverse order

          while (index >= 0) this.interceptors[index--].onError(context);

          // call listeners

          this.onError(context.error);
        });
    }
}
