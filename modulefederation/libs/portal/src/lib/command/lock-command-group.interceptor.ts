import { CommandDescriptor } from "./command-descriptor";
import { CommandInterceptor } from "./command-interceptor";
import { ExecutionContext } from "./execution-context";

/**
 * an interceptor that will disable a group of commands as long as one command of the group is executing.
 */
export class LockCommandGroupInterceptor implements CommandInterceptor {
  // instance data

  private commands: CommandDescriptor[] = []
  private previousState: boolean[] = []

  // private

  private disableCommands(context: ExecutionContext): void {
    const group = context.command.group;
    if (group) {
      this.commands = context.commands.getCommands({ group: group, inherited: true });
      this.previousState = this.commands.map((command) => {
        const old = command.enabled;
        command.enabled = false;

        return old;
      });
    }
  }

  private restoreCommands(): void {
    let i = 0;
    for (const command of this.commands || []) {
      command.enabled = this.previousState[i++];
    }
  }

  // implement CommandInterceptor

  onCall(context: ExecutionContext) {
    this.disableCommands(context);
  }

  onError(context: ExecutionContext): void {
    this.restoreCommands();
  }

  onResult(context: ExecutionContext): void {
    this.restoreCommands();
  }
}