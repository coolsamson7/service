/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { TraceLevel, Tracer } from "@modulefederation/common";
import { CommandConfig } from "./command-config";
import { CommandInterceptor } from "./command-interceptor";
import { ExecutionContext } from "./execution-context";
import { CommandAdministration } from "./with-commands.mixin";

/**
 * a <code>CommandListener</code> can be used in order to be informed about success or failure of a command execution.
 */
export interface CommandListener {
   /**
     * called when the command is called
     * @param command the command
     * @param args the arguments
     */
   onCall(context: ExecutionContext) : void

    /**
     * called when the command has returned a value
     * @param ontext the context
     */
    onResult(context: ExecutionContext) : void

    /**
     * called when the command has returned an error
     * @param context the context
     */
    onError(ontext: ExecutionContext) : void
}

export class CommandDescriptor {
    // instance data

    name: string
    group?: string;
    label?: string;
    tooltip?: string;
    shortcut?: string;
    icon?: string;
    enabled: boolean;
    i18n?: string;
    speech?: string;
    // i don't like this coupling...isn't there a better idea?
    shortcutSubscription? : () => void
    speechSubscription? : () => void

    commands: CommandAdministration; // the declaring container

    superCommand?: CommandDescriptor;
    interceptors: CommandInterceptor[] = [];
    listeners: CommandListener[] = [];

    // constructor

    constructor(commands: CommandAdministration, config: CommandConfig) {
      this.commands = commands
      this.name = config.command!;
      this.group = config.group;
      this.icon = config.icon;
      this.label = config.label ? config.label : config.command;
      this.tooltip = config.tooltip;
      this.shortcut = config.shortcut;
      this.enabled = config.enabled ? config.enabled : true;
      this.i18n = config.i18n;
      this.speech = config.speech;
    }

    // public

    addListener(listener: CommandListener) {
      if (!this.listeners)
         this.listeners = [listener];
      else
         this.listeners.push(listener);
    }

    onCall(context: ExecutionContext) {
      if (Tracer.ENABLED) Tracer.Trace('command', TraceLevel.FULL, 'command on call {0}', context.command.name);

      if (this.listeners)
        for (const listener of this.listeners)
          listener.onCall(context);
    }

    onResult(context: ExecutionContext): void {
      if (Tracer.ENABLED) Tracer.Trace('command', TraceLevel.FULL, 'command on result {0}', context.result);

      if (this.listeners)
        for (const listener of this.listeners)
          listener.onResult(context);
    }

    onError(context: ExecutionContext): void {
      if (Tracer.ENABLED) Tracer.Trace('command', TraceLevel.FULL, 'command on error {0}', context.error);

      if (this.listeners)
        for (const listener of this.listeners)
          listener.onError(context);
    }

    createContext(args: any[], data?: any) :ExecutionContext{
      const context = new ExecutionContext(this, this.commands, args);

      if ( data )
         context.data = data

      return context
    }

    runWithContext(context: ExecutionContext) : Promise<any> {
       // listener

       this.onCall(context)

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

    /**
     * run the command by executing all interceptors.
     * @param args the command arguments
     */
    run(...args: any[]): Promise<any> {
      if (Tracer.ENABLED) Tracer.Trace('command', TraceLevel.FULL, 'run command {0}', this.name);

      return this.runWithContext(this.createContext(args))
    }
}
