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

export interface WithCommandsConfig {
    inheritCommands: boolean
}
 
export function WithCommands<T extends Constructor<AbstractFeature>>(base: T, config: WithCommandsConfig = {inheritCommands: false} ) :Constructor<Commands> &  T  {
    return registerMixins(class CommandManager extends base implements Commands {
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

        // private

        private parentCommandManager() : CommandManager | undefined {
            let parent = this.parent
            while ( parent ) {
               if ( parent instanceof CommandManager)
                  return parent as CommandManager

                  parent = parent.parent
            }

            return undefined
        }

        // implement Commands

        pendingExecutions(): boolean {
            return this.pending.length > 0;
        }

        pushExecutionContext(context: ExecutionContext): void {
            this.pending.push(context);
        }

        popExecutionContext(context: ExecutionContext): void {
            this.pending.splice(this.pending.indexOf(context), 1);
        }

        callSuper<T=any>(...args: any[]) : T {
            if (this.currentExecutionContext) {
                const currentCommand = this.currentExecutionContext.command

                if (currentCommand.superCommand)
                    return currentCommand.superCommand.run(args) as T;
                else 
                    throw new CommandError("no super command " + currentCommand.name);
            }
            else throw new CommandError("no current command execution");
        }

        findCommand(commandName: string): CommandDescriptor | undefined {
            const command = this.commands[commandName];

            if ( command )
                return command
            else {
                const parent = this.parentCommandManager()
                if (config.inheritCommands && parent)
                    return parent.findCommand(commandName)
            }

             return undefined;
        }

        getCommand(commandName: string): CommandDescriptor {
            const command = this.commands[commandName];

            if ( command )
                return command;
            else {
                const parent = this.parentCommandManager()
                if (config.inheritCommands && parent)
                    return parent.getCommand(commandName)
                else 
                    throw new CommandError("no command " + commandName)
            }
        }

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
