import { CommandConfig } from "./command-config";
import { CommandDescriptor } from "./command-descriptor";
import { CommandInterceptor } from "./command-interceptor";

export interface CommandManager {
    findCommand(command: string) : CommandDescriptor | undefined

    callSuper<T=any>(...args: any[]) : T

    getCommand(command: string): CommandDescriptor

    setCommandEnabled(command: string, value: boolean): CommandManager

    addCommandInterceptors(commandConfig: CommandConfig) : CommandInterceptor[]
}