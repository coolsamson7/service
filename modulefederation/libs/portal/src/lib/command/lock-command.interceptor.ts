import { CommandInterceptor } from "./command-interceptor";
import { ExecutionContext } from "./execution-context";

export class LockCommandInterceptor implements CommandInterceptor {
  // static

  static instance = new LockCommandInterceptor()

  // implement CommandInterceptor

  onCall(context: ExecutionContext) {
    context.command.enabled = false;
  }

  onError(context: ExecutionContext): void {
    context.command.enabled = true;
  }

  onResult(context: ExecutionContext): void {
    context.command.enabled = true;
  }
}