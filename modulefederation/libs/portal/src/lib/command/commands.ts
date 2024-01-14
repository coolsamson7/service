import { CommandConfig } from "./command-config";
import { CommandDescriptor } from "./command-descriptor";
import { CommandInterceptor } from "./command-interceptor";
import { ExecutionContext } from "./execution-context";

export interface Commands {
    currentExecutionContext?: ExecutionContext;

    findCommand(command: string) : CommandDescriptor | undefined

    getCommand(command: string): CommandDescriptor

    setCommandEnabled(command: string, value: boolean): Commands

    pendingExecutions(): boolean 

    pushExecutionContext(context: ExecutionContext): void 

    popExecutionContext(context: ExecutionContext): void 

    addCommandInterceptors(commandConfig: CommandConfig) : CommandInterceptor[]
}