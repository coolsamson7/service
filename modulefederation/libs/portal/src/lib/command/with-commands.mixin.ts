/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { inject } from "@angular/core";
import { AbstractFeature } from "../feature";
import { registerMixins } from "../common/lang";
import { Type, TypeDescriptor } from "../common/reflection";
import { TraceLevel, Tracer } from "../tracer";
import { CommandConfig } from "./command-config";
import { CommandDescriptor } from "./command-descriptor";
import { CommandFactory } from "./command-factory";
import { CommandInterceptor } from "./command-interceptor";
import { Command } from "./command.decorator";
import { CommandManager } from "./command-manager";
import { ExecutionContext } from "./execution-context";
import { CommandError } from "./command-error";
import { ShortcutManager } from "../shortcuts";
import { LocaleManager, OnLocaleChange } from "../locale";
import { Observable, of } from "rxjs";
import { get } from '../common';
import { Translator } from "../i18n";


type Constructor<T = any> =  new (...args: any[]) => T;

interface CommandData extends CommandConfig {
   method: string
}

export interface WithCommandsConfig {
    inheritCommands: boolean
}

/**
 * a <code>CommandFilter</code> controls, what commands are returned by the method getCommands
 */
export interface CommandFilter {
    /**
     * if <code>true</code> inherited commands are returned as well
     */
    inherited?: boolean;
    /**
     * an optional group of commands
     */
    group?: string;
  }


export interface CommandAdministration extends CommandManager {
    getCommands(filter: CommandFilter): CommandDescriptor[]

    currentExecutionContext?: ExecutionContext;

    pendingExecutions(): boolean

    pushExecutionContext(context: ExecutionContext): void

    popExecutionContext(context: ExecutionContext): void
}

export function WithCommands<T extends Constructor<AbstractFeature>>(base: T, config: WithCommandsConfig = {inheritCommands: false} ) :Constructor<CommandManager> &  T & OnLocaleChange  {
    class WithCommandsClass extends base implements CommandAdministration, OnLocaleChange {
        // instance data

        private commands: { [key: string]: CommandDescriptor } = {};
        private pending: ExecutionContext[] = [];
        private translator: Translator
        currentExecutionContext?: ExecutionContext;

        // constructor

        constructor(...args: any[]) {
            super(...args);

            this.onDestroy(inject(LocaleManager).subscribe(this))

            this.translator = inject(Translator)

            this.collectCommands(inject(CommandFactory))
        }

        // implement OnLocaleChange

        onLocaleChange(locale: Intl.Locale): Observable<any> {
            for ( const commandName in this.commands) {
                const command = this.commands[commandName]

                // possibly unsubscribe shortcut

                if ( command.shortcutSubscription ) {
                    command.shortcutSubscription()
                    command.shortcutSubscription = undefined
                }

                if ( command.i18n) {
                    this.addI18N(command)

                    // check shortcut again

                    if (command.shortcut)
                        this.registerShortcut(command)
               } // if
            }

            return of()
        }

        // private

        private parentCommandManager() : WithCommandsClass | undefined {
            let parent = this.parent
            while ( parent ) {
               if ( parent instanceof WithCommandsClass)
                  return parent as WithCommandsClass

                  parent = parent.parent
            }

            return undefined
        }

        // implement CommandAdministration

         /**
         * return an array commands, given a filter object
         * @param filter a <code>CommandFilter</code>
         * @see CommandFilter
         */
        getCommands(filter: CommandFilter = {}): CommandDescriptor[] {
            const commands: { [key: string]: CommandDescriptor } = {};

            const collect = (controller: WithCommandsClass) => {
                // recursion

                if (filter.inherited && controller.parentCommandManager())
                    collect(controller.parentCommandManager()!);

                // add commands

                for (const commandName in controller.commands) {
                    const command = controller.commands[commandName];

                    if (filter.group) {
                      if (command.group == filter.group)
                        commands[commandName] = command; // will overwrite in cases of overridden commands
                    }
                    else  commands[commandName] = command;
                }
            };

            // collect everything

            collect(this);

            // done

            return Object.values(commands);
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
                    throw new CommandError(`no super command '${currentCommand.name}'`);
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
                    throw new CommandError(`no command '${commandName}'`)
            }
        }

        setCommandEnabled(command: string, value: boolean): CommandManager {
            this.getCommand(command).enabled = value;

            return this as CommandManager;
        }

        addCommandInterceptors(commandConfig: CommandConfig, interceptors: CommandInterceptor[]) : void {
            // noop
        }

        createdCommand(command: CommandDescriptor) : void {
            // noop
        }

        // private

        private registerShortcut(command: CommandDescriptor) {
            command.shortcutSubscription = this.inject(ShortcutManager).register({
                shortcut: command.shortcut!,
                onShortcut: () => {
                  return command.runWithContext(command.createContext([], {fromShortcut: true}));
                }
              })

            // delete on destroy

            if (!command.shortcutSubscription)
                this.onDestroy(() => {if (command.shortcutSubscription)  command.shortcutSubscription!()});
        }

        private addI18N(commandConfig: CommandConfig) {
            const colon = commandConfig.i18n!.indexOf(":")
            const namespace = commandConfig.i18n!.substring(0, colon)
            const prefix = commandConfig.i18n!.substring(colon + 1)

            let translations = this.translator.findTranslationsFor(namespace)

            if ( translations ) {
                if ( prefix.indexOf(".") > 0)
                    commandConfig.label = get(translations, prefix)
                else {
                    translations = translations[prefix]

                    if ( translations ) {
                        // clear old values that only make sense in the context of i18n
                        // TODO: these are??

                        ["speech"].forEach(name => (<any>commandConfig)[name] = undefined)

                        // set new values

                        Object.getOwnPropertyNames(translations).forEach(name => {
                            switch (name) {
                                case "label":
                                case "tooltip":
                                case "shortcut":
                                case "speech":
                                    if (!(<any>commandConfig)[name])
                                        (<any>commandConfig)[name] = translations[name]
                                break;

                                default:

                            } // switch
                    })
                    }
                } // else
            }
        }

        private addCommand(commandFactory: CommandFactory, commandConfig: CommandConfig) {
            if ( commandConfig.i18n)
               this.addI18N(commandConfig)

            // go

            const inheritedCommand = this.findCommand(commandConfig.command!);

            // create by factory

            const command = commandFactory.createCommand(commandConfig, this as CommandAdministration);

            if (inheritedCommand)
                command.superCommand = inheritedCommand;

            // and register

            this.commands[commandConfig.command!] = command;

            // callback

            this.createdCommand(command)

            // shortcut needed?

            if (command.shortcut)
                this.registerShortcut(command);

            // done

            return command;
        }

        private collectCommands(commandFactory: CommandFactory): void {
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

                    const method = clazz.getOwnMethod(name);
                    if (method)
                        config.action = method.method as (args: any) => Promise<any> | any; // replace function with inherited
                }

                // check decorators bottom up

              for (const method of clazz.filterOwnMethods(method => method.hasDecorator(Command))) {
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

              const commandInstance = this.addCommand(commandFactory, config);

              // replace the function :-)

             (<any>this)[config.method!] = (...args: any[]) => commandInstance.run(...args);
            }
          }
    }//, WithCommands)

    return registerMixins(WithCommandsClass, WithCommands)
  }
