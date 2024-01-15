/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { inject } from "@angular/core";
import { AbstractFeature } from "../feature";
import { registerMixins } from "../mixin/mixin";
import { Type, TypeDescriptor } from "../reflection";
import { TraceLevel, Tracer } from "../tracer";
import { CommandConfig } from "./command-config";
import { CommandDescriptor } from "./command-descriptor";
import { CommandFactory } from "./command-factory";
import { CommandInterceptor } from "./command-interceptor";
import { Command } from "./command.decorator";
import { Commands } from "./commands";
import { ExecutionContext } from "./execution-context";
import { CommandError } from "./command-error";
import { ShortcutManager } from "../shortcuts";


type Constructor<T = any> =  new (...args: any[]) => T;

interface CommandData extends CommandConfig {
   method: string
}

 
export function WithCommands<T extends Constructor<AbstractFeature>>(base: T) :Constructor<Commands> &  T  {
    return registerMixins(class extends base implements Commands {
        // instance data

        private commands: { [key: string]: CommandDescriptor } = {};
        private commandFactory: CommandFactory;
        private pending: ExecutionContext[] = [];
        currentExecutionContext?: ExecutionContext;

        // constructor
      
        constructor(...args: any[]) {
            super(...args);

            this.commandFactory = inject(CommandFactory)

            this.collectCommands()
        }

        // implement Commands

        /**
         * return <code>true</code>, if there are pending executions, <code>false</code> otherwise.
         */
        pendingExecutions(): boolean {
            return this.pending.length > 0;
        }

        pushExecutionContext(context: ExecutionContext): void {
            this.pending.push(context);
        }

        popExecutionContext(context: ExecutionContext): void {
            this.pending.splice(this.pending.indexOf(context), 1);
        }

        /**
         * call any inherited command
         * @param args
         *
        callSuper(...args: any[]): any {
            if (this.currentExecutionContext) {
            if (this.currentExecutionContext.command.superCommand)
                return this.currentExecutionContext.command.superCommand.run(args);
            else throw new NoSuperCommandException(this.currentExecutionContext.command.name);
            } else throw new NoCurrentCommandExecutionException();
        }*/

        findCommand(commandName: string): CommandDescriptor | undefined {
            const command = this.commands[commandName];

            //if (!command && this.parent?.config.inheritCommands) return this.parent.findCommand(commandName);
            //else
             return command;
        }

        getCommand(commandName: string): CommandDescriptor {
            const command = this.commands[commandName];

            //if (!command && this.parent?.config.inheritCommands) return this.parent.findCommand(commandName);
            //else

            if ( command )
                return command;
            else 
                throw new CommandError("no command " + commandName)
        }

        /**
         * set the enabled status of the specific command
         * @param command the command name
         * @param value the enabled status
         */
        setCommandEnabled(command: string, value: boolean): Commands {
            this.getCommand(command).enabled = value;

            return this as Commands;
        }

        addCommandInterceptors(commandConfig: CommandConfig): CommandInterceptor[] {
            return [];
        }

        // private

        private registerShortcut(command: CommandDescriptor) {
           const unsubscribe = this.injector.get(ShortcutManager).register({
                shortcut: command.shortcut!,
                onShortcut: () => {
                  return command.run();
                }
              })

        
            // delete on destroy
        
            this.onDestroy(unsubscribe!);

        }

        private addCommand(commandConfig: CommandConfig) {
            const inheritedCommand = this.findCommand(commandConfig.command!);

            // create by factory

            const command = this.commandFactory.createCommand(commandConfig, this as Commands);

            if (inheritedCommand) command.superCommand = inheritedCommand;

            // and register

            this.commands[commandConfig.command!] = command;

            // shortcut needed?

            if (command.shortcut) this.registerShortcut(command);

            // done

            return command;
        }
  
        private collectCommands(): void {
            const type = TypeDescriptor.forType(this.constructor as Type<any>)

            const configs: { [type: string]: CommandData } = {};

        
            // local function that collects commands from all superclasses and additionally
            // takes care of inherited methods by replacing the appropriate functions in the command config
        
            const collect = (clazz?: TypeDescriptor<any>) => {
              if (clazz) {
                // recursion
        
                collect(clazz.superClass);
        
                // check overridden methods
        
                for (const config of Object.values(configs)) {
                  const name = config.command!;
        
                  const method = clazz.getMethod(name, false);
                  if (method) {
                    config.action = method.method as (args: any) => Promise<any> | any; // replace function with inherited
                  }
                }
        
                // check decorators bottom up
        
              for (const method of clazz.filterMethods((method) => method.hasDecorator(Command), false)) {
                const command : CommandData = method.getDecorator(Command)?.arguments[0]

                command.method = method.name
    
                if (configs[command.command!])
                    // a decorator overrides a parent decorator
                    Object.assign(configs[command.command!], command);
                    // leave inherited properties
                else 
                    configs[command.command!] = command;
               } // for
              }
            }
        
            // collect all decorated command configs
        
            collect(type);
        
            // add as commands
        
            for (const config of Object.values(configs)) {
              if (Tracer.ENABLED)
                Tracer.Trace('command', TraceLevel.HIGH, 'add command {0}', config.command);
        
              const commandInstance = this.addCommand(config); 
        
              // replace the function :-)
        
             (<any>this)[config.method!] = (...args: any[]) => commandInstance.run(...args);
            }
          }
    }, WithCommands)
  }
